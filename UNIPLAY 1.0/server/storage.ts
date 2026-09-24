import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { FullLectureData, JobProgress, UserStats } from '../src/types/index.js';
import { PRESET_LECTURES } from './presetLectures.js';

const { Pool } = pg;

// Default initial user stats
export const DEFAULT_USER_STATS: UserStats = {
  xp: 1240,
  level: 7,
  streakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  videosWatched: 6,
  quizzesCompleted: 5,
  quizAccuracy: 86,
  gamesPlayed: 14,
  recentScores: [
    { activity: 'Match Concepts: Anatomy', score: 820, lectureTitle: 'Human Anatomy & Circulatory Dynamics', date: 'Today' },
    { activity: 'Rapid Fire: Physics', score: 1240, lectureTitle: "Physics: Newton's Laws & Classical Dynamics", date: 'Yesterday' },
    { activity: 'Macroeconomics Quiz', score: 950, lectureTitle: 'Macroeconomics: Supply, Demand & Equilibrium', date: '2 days ago' },
  ],
  masteredLectureIds: ['anatomy-circulatory-system'],
  unlockedAchievementIds: ['first-lesson', 'quiz-streak', 'game-explorer', 'five-day-streak'],
};

export class PersistentStorage {
  private pool: pg.Pool | null = null;
  private storageType: 'postgres' | 'file' | 'memory' = 'memory';
  private dataDir: string;

  // In-memory cache for fast synchronous reads and offline fallback
  private lecturesCache = new Map<string, FullLectureData>();
  private jobsCache = new Map<string, JobProgress>();
  private userStatsCache: UserStats = { ...DEFAULT_USER_STATS };

  constructor() {
    this.dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
  }

  public async init(): Promise<void> {
    // 1. Seed in-memory cache with presets first
    for (const [id, data] of Object.entries(PRESET_LECTURES)) {
      this.lecturesCache.set(id, data);
    }

    // 2. Check for PostgreSQL connection via DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        console.log('[UNIPLAY Storage] Connecting to PostgreSQL database...');
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: process.env.NODE_ENV === 'production' && !dbUrl.includes('localhost') ? { rejectUnauthorized: false } : undefined,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        // Test connection and run migrations
        await this.initPostgresSchema();
        this.storageType = 'postgres';
        console.log('[UNIPLAY Storage] Successfully connected to PostgreSQL. Persistent cloud storage active.');

        // Hydrate from PostgreSQL
        await this.hydrateFromPostgres();
        return;
      } catch (err: any) {
        console.warn('[UNIPLAY Storage] PostgreSQL connection failed, falling back to file/memory storage:', err?.message || err);
        this.pool = null;
      }
    }

    // 3. Fallback: File-based persistence
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      this.storageType = 'file';
      this.hydrateFromFile();
      console.log(`[UNIPLAY Storage] File-backed persistence active at ${this.dataDir}`);
    } catch (err) {
      console.warn('[UNIPLAY Storage] File storage unavailable, using in-memory store:', err);
      this.storageType = 'memory';
    }
  }

  public getStorageType(): 'postgres' | 'file' | 'memory' {
    return this.storageType;
  }

  // -------------------------------------------------------------
  // PostgreSQL Schema Setup & Hydration
  // -------------------------------------------------------------
  private async initPostgresSchema(): Promise<void> {
    if (!this.pool) return;
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS uniplay_lectures (
          id VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS uniplay_jobs (
          id VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS uniplay_user_stats (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS uniplay_documents (
          id VARCHAR(255) PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          content_text TEXT NOT NULL,
          file_size VARCHAR(50),
          created_at BIGINT NOT NULL
        );
      `);
    } finally {
      client.release();
    }
  }

  private async hydrateFromPostgres(): Promise<void> {
    if (!this.pool) return;
    try {
      // Hydrate lectures
      const lecRes = await this.pool.query('SELECT id, data FROM uniplay_lectures');
      for (const row of lecRes.rows) {
        this.lecturesCache.set(row.id, row.data);
      }

      // Ensure presets are saved to Postgres if not present
      for (const [id, data] of Object.entries(PRESET_LECTURES)) {
        if (!this.lecturesCache.has(id)) {
          this.lecturesCache.set(id, data);
          await this.saveLecture(id, data);
        }
      }

      // Hydrate jobs
      const jobsRes = await this.pool.query('SELECT id, data FROM uniplay_jobs ORDER BY updated_at DESC LIMIT 50');
      for (const row of jobsRes.rows) {
        this.jobsCache.set(row.id, row.data);
      }

      // Hydrate user stats
      const statsRes = await this.pool.query("SELECT data FROM uniplay_user_stats WHERE id = 'default'");
      if (statsRes.rows.length > 0 && statsRes.rows[0].data) {
        this.userStatsCache = statsRes.rows[0].data;
      } else {
        await this.saveUserStats(this.userStatsCache);
      }
    } catch (err) {
      console.error('[UNIPLAY Storage] Error hydrating from PostgreSQL:', err);
    }
  }

  // -------------------------------------------------------------
  // File-based Hydration & Persistence
  // -------------------------------------------------------------
  private hydrateFromFile(): void {
    try {
      const lecPath = path.join(this.dataDir, 'lectures.json');
      if (fs.existsSync(lecPath)) {
        const raw = fs.readFileSync(lecPath, 'utf-8');
        const data = JSON.parse(raw);
        for (const [id, lec] of Object.entries(data)) {
          this.lecturesCache.set(id, lec as FullLectureData);
        }
      }

      // Ensure presets exist
      for (const [id, data] of Object.entries(PRESET_LECTURES)) {
        if (!this.lecturesCache.has(id)) {
          this.lecturesCache.set(id, data);
        }
      }
      this.persistLecturesToFile();

      const jobsPath = path.join(this.dataDir, 'jobs.json');
      if (fs.existsSync(jobsPath)) {
        const raw = fs.readFileSync(jobsPath, 'utf-8');
        const data = JSON.parse(raw);
        for (const [id, job] of Object.entries(data)) {
          this.jobsCache.set(id, job as JobProgress);
        }
      }

      const statsPath = path.join(this.dataDir, 'stats.json');
      if (fs.existsSync(statsPath)) {
        const raw = fs.readFileSync(statsPath, 'utf-8');
        this.userStatsCache = JSON.parse(raw);
      }
    } catch (err) {
      console.error('[UNIPLAY Storage] Error hydrating from files:', err);
    }
  }

  private persistLecturesToFile(): void {
    if (this.storageType !== 'file') return;
    try {
      const obj: Record<string, FullLectureData> = {};
      for (const [id, val] of this.lecturesCache.entries()) {
        obj[id] = val;
      }
      fs.writeFileSync(path.join(this.dataDir, 'lectures.json'), JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[UNIPLAY Storage] Error saving lectures to file:', err);
    }
  }

  private persistJobsToFile(): void {
    if (this.storageType !== 'file') return;
    try {
      const obj: Record<string, JobProgress> = {};
      for (const [id, val] of this.jobsCache.entries()) {
        obj[id] = val;
      }
      fs.writeFileSync(path.join(this.dataDir, 'jobs.json'), JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[UNIPLAY Storage] Error saving jobs to file:', err);
    }
  }

  private persistStatsToFile(): void {
    if (this.storageType !== 'file') return;
    try {
      fs.writeFileSync(path.join(this.dataDir, 'stats.json'), JSON.stringify(this.userStatsCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('[UNIPLAY Storage] Error saving stats to file:', err);
    }
  }

  // -------------------------------------------------------------
  // Public Lecture Store API
  // -------------------------------------------------------------
  public async saveLecture(id: string, data: FullLectureData): Promise<void> {
    this.lecturesCache.set(id, data);

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO uniplay_lectures (id, data, updated_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = $3`,
          [id, JSON.stringify(data), Date.now()]
        );
      } catch (err) {
        console.error(`[UNIPLAY Storage] Failed to persist lecture ${id} to Postgres:`, err);
      }
    } else if (this.storageType === 'file') {
      this.persistLecturesToFile();
    }
  }

  public getLecture(id: string): FullLectureData | undefined {
    return this.lecturesCache.get(id);
  }

  public listLectures(): FullLectureData[] {
    return Array.from(this.lecturesCache.values());
  }

  // -------------------------------------------------------------
  // Public Job Store API
  // -------------------------------------------------------------
  public async saveJob(id: string, data: JobProgress): Promise<void> {
    this.jobsCache.set(id, data);

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO uniplay_jobs (id, data, updated_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = $3`,
          [id, JSON.stringify(data), Date.now()]
        );
      } catch (err) {
        console.error(`[UNIPLAY Storage] Failed to persist job ${id} to Postgres:`, err);
      }
    } else if (this.storageType === 'file') {
      this.persistJobsToFile();
    }
  }

  public getJob(id: string): JobProgress | undefined {
    return this.jobsCache.get(id);
  }

  public listJobs(): JobProgress[] {
    return Array.from(this.jobsCache.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  // -------------------------------------------------------------
  // Public Document / Upload Store API
  // -------------------------------------------------------------
  public async saveDocument(id: string, fileName: string, contentText: string, fileSize?: string): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO uniplay_documents (id, file_name, content_text, file_size, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET content_text = $3, file_size = $4`,
          [id, fileName, contentText, fileSize || '2.5 MB', Date.now()]
        );
      } catch (err) {
        console.error(`[UNIPLAY Storage] Failed to persist document ${id} to Postgres:`, err);
      }
    } else if (this.storageType === 'file') {
      try {
        const docsDir = path.join(this.dataDir, 'documents');
        if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
        fs.writeFileSync(path.join(docsDir, `${id}.txt`), contentText, 'utf-8');
      } catch (err) {
        console.error('[UNIPLAY Storage] Failed to write document to disk:', err);
      }
    }
  }

  // -------------------------------------------------------------
  // Public User Progress & Stats Store API
  // -------------------------------------------------------------
  public getUserStats(): UserStats {
    return { ...this.userStatsCache };
  }

  public async saveUserStats(stats: UserStats): Promise<void> {
    this.userStatsCache = { ...stats };

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO uniplay_user_stats (id, data, updated_at)
           VALUES ('default', $1, $2)
           ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = $2`,
          [JSON.stringify(stats), Date.now()]
        );
      } catch (err) {
        console.error('[UNIPLAY Storage] Failed to persist user stats to Postgres:', err);
      }
    } else if (this.storageType === 'file') {
      this.persistStatsToFile();
    }
  }
}

export const storage = new PersistentStorage();
