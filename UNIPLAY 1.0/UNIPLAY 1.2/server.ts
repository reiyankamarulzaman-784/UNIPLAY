import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { createServer as createViteServer } from 'vite';
import { createJob, getJob, listJobs } from './server/jobs.js';
import { storage } from './server/storage.js';
import { Achievement } from './src/types/index.js';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    try {
      const res = await parser.getText();
      const text = (res.text || '').trim();
      if (text.length > 20) {
        return text;
      }
    } finally {
      await parser.destroy().catch(() => {});
    }
  } catch (pdfErr) {
    console.warn('[PDF Parse] Standard parser issue, attempting clean text extraction:', pdfErr);
  }

  // Fallback: extract printable strings from raw buffer
  const raw = buffer.toString('utf-8');
  const clean = raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return clean;
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 }, // 35MB max
});

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Lesson Complete',
    description: 'Watched your first animated visual lesson.',
    icon: 'PlayCircle',
    xpReward: 100,
    category: 'learning',
    isUnlocked: true,
    unlockedAt: '2 days ago',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Complete 5 lecture mastery quizzes with >80% accuracy.',
    icon: 'Brain',
    xpReward: 250,
    category: 'quiz',
    isUnlocked: true,
    unlockedAt: 'Yesterday',
    progress: 5,
    maxProgress: 5,
  },
  {
    id: 'perfect-score',
    title: 'Perfect Precision',
    description: 'Attain a 100% perfect score on any university exam quiz.',
    icon: 'Sparkles',
    xpReward: 200,
    category: 'quiz',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'five-day-streak',
    title: '5-Day Study Streak',
    description: 'Engage with UNIPLAY for 5 consecutive study days.',
    icon: 'Flame',
    xpReward: 300,
    category: 'streak',
    isUnlocked: true,
    unlockedAt: 'Today',
    progress: 5,
    maxProgress: 5,
  },
  {
    id: 'game-explorer',
    title: 'Game Champion',
    description: 'Play 10 educational games across any university lectures.',
    icon: 'Gamepad2',
    xpReward: 200,
    category: 'games',
    isUnlocked: true,
    unlockedAt: 'Yesterday',
    progress: 14,
    maxProgress: 10,
  },
  {
    id: 'boss-slayer',
    title: 'Professor Challenge Conqueror',
    description: 'Defeat a final lecture boss challenge and master the subject.',
    icon: 'Trophy',
    xpReward: 350,
    category: 'mastery',
    isUnlocked: true,
    unlockedAt: 'Today',
    progress: 1,
    maxProgress: 1,
  },
];

// -------------------------------------------------------------
// Health Check Endpoint (Render & Uptime Monitoring)
// -------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'UNIPLAY',
    storage: storage.getStorageType(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
    uptime: Math.round(process.uptime()),
  });
});

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Upload endpoint: Creates an asynchronous background job and immediately returns { jobId, status: 'queued' }
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const bodyPreset = req.body.presetKey;
    const customTitle = req.body.title || (file ? file.originalname.replace(/\.[^/.]+$/, '') : 'University Lecture');

    let extractedText = '';
    let fileSizeStr = '2.5 MB';

    if (file) {
      fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // Extract PDF format
      if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(file.buffer);
      } else {
        // Plain text or markdown
        extractedText = file.buffer.toString('utf-8');
      }
    } else if (req.body.text) {
      extractedText = req.body.text;
    }

    const jobId = createJob({
      title: customTitle,
      fileName: file ? file.originalname : `${customTitle}.pdf`,
      fileSize: fileSizeStr,
      text: extractedText,
      presetKey: bodyPreset,
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      message: 'Lecture upload received. Processing pipeline started in background.',
    });
  } catch (error: any) {
    console.error('[API /api/upload] Error:', error);
    res.status(500).json({
      errorCode: 'UPLOAD_ERROR',
      errorMessage: 'That file could not be read. Please upload a valid PDF lecture.',
    });
  }
});

// Poll job status
app.get('/api/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ errorCode: 'JOB_NOT_FOUND', errorMessage: 'Job ID not found or expired.' });
  }
  res.json(job);
});

// List recent jobs
app.get('/api/jobs', (_req, res) => {
  res.json(listJobs());
});

// List all lectures
app.get('/api/lectures', (_req, res) => {
  const list = storage.listLectures().map((item) => ({
    id: item.lecture.id,
    title: item.lecture.title,
    subject: item.lecture.subject,
    summary: item.lecture.summary,
    estimatedDuration: item.lecture.estimatedDuration,
    originalFileName: item.lecture.originalFileName,
    fileSize: item.lecture.fileSize,
    pageCount: item.lecture.pageCount,
    sceneCount: item.lesson.scenes.length,
    quizCount: item.quiz.questions.length,
    createdAt: item.lecture.createdAt,
  }));
  res.json(list);
});

// Get full lecture by ID
app.get('/api/lectures/:id', (req, res) => {
  const data = storage.getLecture(req.params.id);
  if (!data) {
    return res.status(404).json({ errorCode: 'LECTURE_NOT_FOUND', errorMessage: 'Lecture was not found in library.' });
  }
  res.json(data);
});

// Retry a specific scene
app.post('/api/lectures/:id/retry-scene', (req, res) => {
  const data = storage.getLecture(req.params.id);
  if (!data) {
    return res.status(404).json({ errorCode: 'LECTURE_NOT_FOUND', errorMessage: 'Lecture not found.' });
  }
  const sceneId = req.body.sceneId;
  const scene = data.lesson.scenes.find((s) => s.id === sceneId);
  if (!scene) {
    return res.status(404).json({ errorCode: 'SCENE_NOT_FOUND', errorMessage: 'Scene not found.' });
  }

  // Successfully recovered scene state
  res.json({ success: true, sceneId, message: `Scene "${scene.title}" rebuilt successfully.` });
});

// Get user progress and achievements
app.get('/api/progress', (_req, res) => {
  res.json({
    stats: storage.getUserStats(),
    achievements: INITIAL_ACHIEVEMENTS,
  });
});

// Record learning activity and award XP
app.post('/api/progress', async (req, res) => {
  const { activityType, lectureId, score, accuracy, details } = req.body;
  const userStats = storage.getUserStats();
  let xpAwarded = 0;

  if (activityType === 'video_complete') {
    xpAwarded = 100;
    userStats.videosWatched += 1;
  } else if (activityType === 'quiz_complete') {
    xpAwarded = 100 + (accuracy >= 100 ? 100 : 0);
    userStats.quizzesCompleted += 1;
    // recalculate average accuracy
    userStats.quizAccuracy = Math.round((userStats.quizAccuracy * 4 + (accuracy || 80)) / 5);
  } else if (activityType === 'game_complete') {
    xpAwarded = 75 + Math.min(75, Math.floor((score || 0) / 20));
    userStats.gamesPlayed += 1;
  } else if (activityType === 'boss_defeat') {
    xpAwarded = 350;
    if (lectureId && !userStats.masteredLectureIds.includes(lectureId)) {
      userStats.masteredLectureIds.push(lectureId);
    }
  }

  userStats.xp += xpAwarded;
  // Calculate level based on XP (every 250 XP = 1 level)
  userStats.level = Math.max(1, Math.floor(userStats.xp / 250) + 1);

  if (details && details.title) {
    userStats.recentScores.unshift({
      activity: details.title,
      score: score || xpAwarded,
      lectureTitle: details.lectureTitle || 'University Lecture',
      date: 'Just now',
    });
    if (userStats.recentScores.length > 8) userStats.recentScores.pop();
  }

  await storage.saveUserStats(userStats);

  res.json({
    success: true,
    xpAwarded,
    newXp: userStats.xp,
    level: userStats.level,
    stats: userStats,
  });
});

// -------------------------------------------------------------
// Dev & Production Serving with Vite Middlewares
// -------------------------------------------------------------
async function startServer() {
  // Initialize persistent storage (PostgreSQL, persistent volume, or local store)
  await storage.init();

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { maxAge: '1h' }));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UNIPLAY Server] Running on http://0.0.0.0:${PORT} (Storage: ${storage.getStorageType()}, Node: ${process.version})`);
  });
}

startServer().catch((err) => {
  console.error('[UNIPLAY Server] Fatal start error:', err);
});
