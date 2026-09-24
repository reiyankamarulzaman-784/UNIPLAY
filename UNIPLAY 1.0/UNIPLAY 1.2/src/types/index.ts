export type SubjectArea =
  | 'Biology'
  | 'Medicine'
  | 'Economics'
  | 'Physics'
  | 'Chemistry'
  | 'Computer Science'
  | 'Mathematics'
  | 'History'
  | 'Psychology'
  | 'General';

export type JobStatus =
  | 'queued'
  | 'uploading'
  | 'validating'
  | 'processing_document'
  | 'analyzing'
  | 'creating_lesson'
  | 'creating_storyboard'
  | 'generating_visuals'
  | 'generating_narration'
  | 'assembling_video'
  | 'creating_quiz'
  | 'creating_games'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface JobProgress {
  jobId: string;
  lectureId?: string;
  status: JobStatus;
  stage: string;
  progress: number; // 0 - 100
  message: string;
  subMessage?: string;
  logs: string[];
  errorCode?: string;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface ConceptDetail {
  id: string;
  name: string;
  explanation: string;
  importantFacts: string[];
  terms: string[];
  formulas?: string[];
  examples: string[];
  visualIdeas: string[];
}

export interface TopicSection {
  id: string;
  title: string;
  summary: string;
  concepts: ConceptDetail[];
}

export interface LectureKnowledgeBase {
  id: string;
  title: string;
  subject: SubjectArea;
  summary: string;
  estimatedDuration: string;
  originalFileName: string;
  fileSize?: string;
  pageCount?: number;
  learningObjectives: string[];
  keyTerms: { term: string; definition: string }[];
  formulas: { name: string; formula: string; explanation: string; variables: { symbol: string; label: string }[] }[];
  topics: TopicSection[];
  createdAt: number;
}

export type VisualType =
  | 'animated_diagram'
  | 'process_animation'
  | 'scientific_visualization'
  | 'graph_animation'
  | 'physics_simulation'
  | 'molecule_animation'
  | 'anatomical_animation'
  | 'flowchart'
  | 'timeline'
  | 'system_diagram'
  | 'step_by_step'
  | 'comparison'
  | 'cause_and_effect'
  | 'mathematical_visualization';

export interface VisualAnimationElement {
  id: string;
  type: 'node' | 'arrow' | 'particle_stream' | 'label' | 'curve' | 'pulse_zone' | 'box' | 'formula';
  label?: string;
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  color?: string;
  secondaryColor?: string;
  size?: number;
  animation?: 'pulse' | 'flow' | 'slide_in' | 'expand' | 'orbit' | 'shift_curve' | 'contract';
  direction?: 'up' | 'down' | 'left' | 'right';
  activeAtSecond?: number;
}

export interface Scene {
  id: string;
  order: number;
  duration: number; // seconds
  title: string;
  narration: string;
  visualType: VisualType;
  visualDescription: string;
  customVisualKey?: 'heart_circulatory' | 'supply_demand' | 'mitochondria_atp' | 'newton_dynamics' | 'generic_diagram';
  elements: VisualAnimationElement[];
  labels: { text: string; x: number; y: number; highlight?: boolean }[];
  keyTakeaway: string;
  audioUrl?: string;
}

export interface Lesson {
  id: string;
  lectureId: string;
  title: string;
  summary: string;
  totalDuration: number; // in seconds
  scenes: Scene[];
}

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'fill_in_the_blank'
  | 'scenario'
  | 'calculation';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  lectureConceptSource: string;
}

export interface Quiz {
  id: string;
  lectureId: string;
  title: string;
  questions: QuizQuestion[];
}

// Games
export interface MatchPair {
  id: string;
  term: string;
  definition: string;
  category?: string;
}

export interface MemoryCard {
  id: string;
  pairId: string;
  type: 'term' | 'definition';
  content: string;
}

export interface RapidQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  concept: string;
}

export interface SortCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SortItem {
  id: string;
  text: string;
  categoryId: string;
  hint?: string;
}

export interface OrderItem {
  id: string;
  stepNumber: number;
  text: string;
  detail?: string;
}

export interface FormulaToken {
  id: string;
  token: string; // e.g. "F", "=", "m", "×", "a"
  type: 'variable' | 'operator' | 'constant';
}

export interface FormulaChallenge {
  id: string;
  name: string;
  prompt: string;
  targetSequence: string[]; // ["F", "=", "m", "×", "a"]
  scrambledTokens: FormulaToken[];
  followUpProblem?: {
    question: string;
    variables: Record<string, number>;
    answer: number;
    unit: string;
  };
}

export interface DiagramHotspot {
  id: string;
  label: string;
  targetX: number; // 0 - 100%
  targetY: number; // 0 - 100%
  description: string;
}

export interface DiagramGameData {
  diagramTitle: string;
  diagramType: 'circulatory_system' | 'cell_structure' | 'market_graph' | 'physics_vectors' | 'generic';
  hotspots: DiagramHotspot[];
}

export interface BossPhase {
  phase: number;
  title: string;
  bossDialog: string;
  question: QuizQuestion;
  damageToBoss: number;
}

export interface BossChallengeData {
  bossName: string;
  bossTitle: string;
  totalHp: number;
  phases: BossPhase[];
  masteryRewardXp: number;
}

export interface LectureGames {
  lectureId: string;
  matchConcepts: {
    title: string;
    instructions: string;
    pairs: MatchPair[];
  };
  memoryMatch: {
    title: string;
    instructions: string;
    pairs: MatchPair[];
  };
  rapidFire: {
    title: string;
    instructions: string;
    questions: RapidQuestion[];
    timePerQuestion: number; // e.g. 10s
  };
  sortIt: {
    title: string;
    instructions: string;
    categories: SortCategory[];
    items: SortItem[];
  };
  putItInOrder: {
    title: string;
    instructions: string;
    processName: string;
    items: OrderItem[];
  };
  formulaBuilder?: {
    title: string;
    instructions: string;
    challenges: FormulaChallenge[];
  };
  diagramLabeler?: DiagramGameData;
  bossChallenge: BossChallengeData;
}

export interface FullLectureData {
  lecture: LectureKnowledgeBase;
  lesson: Lesson;
  quiz: Quiz;
  games: LectureGames;
}

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  videosWatched: number;
  quizzesCompleted: number;
  quizAccuracy: number; // percentage 0 - 100
  gamesPlayed: number;
  recentScores: {
    activity: string;
    score: number;
    lectureTitle: string;
    date: string;
  }[];
  masteredLectureIds: string[];
  unlockedAchievementIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'learning' | 'quiz' | 'games' | 'streak' | 'mastery';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}
