export interface LinkedChildSummary {
  _id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  student_code?: string;
  grade_level?: string;
  current_streak?: number;
  lessons_completed?: number;
}

export interface LessonSessionSummary {
  session_id: string;
  lesson_title?: string;
  course_name?: string;
  status: "active" | "completed" | "abandoned";
  current_section_order?: number;
  total_sections?: number;
  completed_at?: string;
  checkpoint_logs?: { is_correct: boolean }[];
  dialogue_logs?: unknown[];
}

export interface ParentAchievement {
  _id?: string;
  title: string;
  description?: string;
  badge_icon?: string;
  category: string;
  awarded_at: string;
}

export interface StrugglingConceptSummary {
  concept_id: string;
  concept_label: string;
  times_tested?: number;
  times_wrong?: number;
  last_diagnosed_misconception?: string | null;
}

export interface ChildProgress extends LinkedChildSummary {
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  checkpoint_accuracy: number;
  checkpoints_correct: number;
  checkpoints_total: number;
  weekly_activity?: Record<string, number>;
  struggling_concepts?: StrugglingConceptSummary[];
  sessions?: LessonSessionSummary[] | null;
  achievements?: ParentAchievement[] | null;
}

export interface ParentTeacherSummary {
  _id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  specialization?: string;
  school_name?: string;
  email?: string;
}
