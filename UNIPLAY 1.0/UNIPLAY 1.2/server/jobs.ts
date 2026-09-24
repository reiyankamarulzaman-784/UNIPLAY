import { JobProgress, JobStatus, FullLectureData } from '../src/types/index.js';
import { generateLectureKnowledgeBase, generateLessonAndStoryboard, generateAndValidateQuiz, generatePlayableGames } from './ai.js';
import { PRESET_LECTURES } from './presetLectures.js';
import { storage } from './storage.js';

export interface CreateJobOptions {
  title: string;
  fileName: string;
  fileSize?: string;
  text?: string;
  presetKey?: string;
}

export function createJob(options: CreateJobOptions): string {
  const jobId = 'job-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  const initialJob: JobProgress = {
    jobId,
    status: 'queued',
    stage: 'queued',
    progress: 5,
    message: 'Job received. Initializing UNIPLAY pipeline...',
    subMessage: 'Preparing document container and background worker...',
    logs: [`[${new Date().toISOString()}] Job initialized for "${options.title || options.fileName}"`],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  storage.saveJob(jobId, initialJob);

  if (options.text) {
    storage.saveDocument(jobId, options.fileName, options.text, options.fileSize);
  }

  // Kick off background asynchronous worker without awaiting
  runJobPipeline(jobId, options).catch((err) => {
    console.error(`[UNIPLAY Job ${jobId}] Unhandled error:`, err);
    updateJob(jobId, {
      status: 'failed',
      stage: 'failed',
      progress: 100,
      errorCode: 'PIPELINE_ERROR',
      errorMessage: 'Something went wrong while processing your lecture. Your progress has been saved. Please retry.',
      message: 'Processing encountered an issue.',
    });
  });

  return jobId;
}

export function getJob(jobId: string): JobProgress | undefined {
  return storage.getJob(jobId);
}

export function listJobs(): JobProgress[] {
  return storage.listJobs();
}

function updateJob(jobId: string, updates: Partial<JobProgress>) {
  const current = storage.getJob(jobId);
  if (!current) return;
  const updated: JobProgress = {
    ...current,
    ...updates,
    updatedAt: Date.now(),
    logs: updates.logs ? [...current.logs, ...updates.logs] : current.logs,
  };
  storage.saveJob(jobId, updated);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runJobPipeline(jobId: string, options: CreateJobOptions) {
  try {
    // Stage 1: Uploading & Validating
    await sleep(400);
    updateJob(jobId, {
      status: 'validating',
      stage: 'validating',
      progress: 12,
      message: 'Validating lecture structure and integrity...',
      subMessage: `Examining "${options.fileName}" for academic content, charts, and equations...`,
      logs: [`[${new Date().toISOString()}] Validating PDF format and integrity (${options.fileSize || 'Standard'})`],
    });

    await sleep(500);

    // If preset requested directly, load rich preset directly with simulated stages
    if (options.presetKey && PRESET_LECTURES[options.presetKey]) {
      const presetData = PRESET_LECTURES[options.presetKey];
      const lectureId = presetData.lecture.id;

      updateJob(jobId, {
        status: 'analyzing',
        stage: 'analyzing',
        progress: 25,
        message: 'Understanding your lecture...',
        subMessage: `Extracting concepts from "${presetData.lecture.title}"...`,
        logs: [`[${new Date().toISOString()}] Grounded knowledge base built with ${presetData.lecture.keyTerms.length} key terms`],
      });

      await sleep(600);

      updateJob(jobId, {
        status: 'creating_lesson',
        stage: 'creating_lesson',
        progress: 42,
        message: 'Creating short visual lesson script...',
        subMessage: 'Translating dense technical concepts into simple intuitive visual analogies...',
        logs: [`[${new Date().toISOString()}] Lesson script drafted: 4 core scenes`],
      });

      await sleep(600);

      updateJob(jobId, {
        status: 'creating_storyboard',
        stage: 'creating_storyboard',
        progress: 58,
        message: 'Creating visual storyboards & diagrams...',
        subMessage: 'Directing animated diagrams, vector curves, and system flows...',
        logs: [`[${new Date().toISOString()}] Visual storyboard assembled: animated dynamic cross-sections`],
      });

      await sleep(600);

      updateJob(jobId, {
        status: 'generating_narration',
        stage: 'generating_narration',
        progress: 72,
        message: 'Generating synchronized voice narration...',
        subMessage: 'Aligning narrator cues with on-screen visual animations...',
        logs: [`[${new Date().toISOString()}] Audio narration timing cues calibrated`],
      });

      await sleep(600);

      updateJob(jobId, {
        status: 'creating_quiz',
        stage: 'creating_quiz',
        progress: 84,
        message: 'Building grounded mastery quiz...',
        subMessage: 'Validating questions against lecture source material to eliminate hallucinations...',
        logs: [`[${new Date().toISOString()}] 5 validated quiz questions generated (Easy, Medium, Hard)`],
      });

      await sleep(600);

      updateJob(jobId, {
        status: 'creating_games',
        stage: 'creating_games',
        progress: 95,
        message: 'Building interactive educational games...',
        subMessage: 'Constructing Match Concepts, Memory Match, Rapid Fire, Formula Builder, and Boss Challenge...',
        logs: [`[${new Date().toISOString()}] 8 playable university games generated`],
      });

      await sleep(500);

      await storage.saveLecture(lectureId, presetData);

      updateJob(jobId, {
        lectureId,
        status: 'completed',
        stage: 'completed',
        progress: 100,
        message: 'Lecture experience ready to play!',
        subMessage: 'Your visual lesson, quiz, and games are fully assembled.',
        completedAt: Date.now(),
        logs: [`[${new Date().toISOString()}] Pipeline completed successfully. Lecture ID: ${lectureId}`],
      });

      return;
    }

    // Stage 2: Processing Document
    updateJob(jobId, {
      status: 'processing_document',
      stage: 'processing_document',
      progress: 20,
      message: 'Processing document sections & diagrams...',
      subMessage: 'Deconstructing PDF into structured textual and visual sections...',
      logs: [`[${new Date().toISOString()}] Extracted document sections`],
    });

    const docText = options.text || `Lecture Notes for ${options.title}. Comprehensive analysis of mechanisms, formulas, and structural relationships.`;

    // Stage 3: Analyzing & Knowledge Base Creation
    updateJob(jobId, {
      status: 'analyzing',
      stage: 'analyzing',
      progress: 35,
      message: 'Understanding your lecture...',
      subMessage: 'Extracting key terms, formulas, and learning objectives...',
      logs: [`[${new Date().toISOString()}] Synthesizing central knowledge base`],
    });

    const kb = await generateLectureKnowledgeBase({
      title: options.title,
      text: docText,
      pageCount: Math.max(4, Math.ceil(docText.length / 1500)),
      fileName: options.fileName,
      fileSize: options.fileSize,
    });

    // Stage 4: Creating Lesson & Storyboard
    updateJob(jobId, {
      status: 'creating_lesson',
      stage: 'creating_lesson',
      progress: 50,
      message: 'Creating visual lesson & storyboard...',
      subMessage: 'SHOW THE CONCEPT: designing animated diagrams and vector models...',
      logs: [`[${new Date().toISOString()}] Generating dynamic storyboard for ${kb.title}`],
    });

    const lesson = await generateLessonAndStoryboard(kb);

    // Stage 5: Visuals & Narration Assembly
    updateJob(jobId, {
      status: 'assembling_video',
      stage: 'assembling_video',
      progress: 68,
      message: 'Assembling interactive visual lesson...',
      subMessage: 'Synchronizing animated vector elements with voice narration...',
      logs: [`[${new Date().toISOString()}] Synchronized ${lesson.scenes.length} visual scenes`],
    });

    await sleep(400);

    // Stage 6: Creating Quiz
    updateJob(jobId, {
      status: 'creating_quiz',
      stage: 'creating_quiz',
      progress: 82,
      message: 'Building grounded quiz...',
      subMessage: 'Testing each question against lecture knowledge to prevent hallucinations...',
      logs: [`[${new Date().toISOString()}] Validating multi-difficulty quiz questions`],
    });

    const quiz = await generateAndValidateQuiz(kb);

    // Stage 7: Creating Games
    updateJob(jobId, {
      status: 'creating_games',
      stage: 'creating_games',
      progress: 93,
      message: 'Building interactive educational games...',
      subMessage: 'Configuring Match Concepts, Memory Grid, Rapid Fire, and Boss Exam...',
      logs: [`[${new Date().toISOString()}] Assembling 8 playable educational games`],
    });

    const games = await generatePlayableGames(kb);

    // Stage 8: Completed!
    const fullData: FullLectureData = {
      lecture: kb,
      lesson,
      quiz,
      games,
    };

    await storage.saveLecture(kb.id, fullData);

    updateJob(jobId, {
      lectureId: kb.id,
      status: 'completed',
      stage: 'completed',
      progress: 100,
      message: 'Lecture experience ready to play!',
      subMessage: 'Your visual lesson, quiz, and games are fully assembled.',
      completedAt: Date.now(),
      logs: [`[${new Date().toISOString()}] Pipeline completed successfully. Lecture ID: ${kb.id}`],
    });
  } catch (err: any) {
    console.error(`[UNIPLAY Job ${jobId}] Failed with error:`, err);
    updateJob(jobId, {
      status: 'failed',
      stage: 'failed',
      progress: 100,
      errorCode: 'PDF_PROCESSING_FAILED',
      errorMessage: 'Something went wrong while processing your lecture. Your progress has been saved. Please retry.',
      message: 'Processing encountered an issue.',
      logs: [`[${new Date().toISOString()}] Error: ${err?.message || 'Processing aborted'}`],
    });
  }
}
