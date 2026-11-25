export interface LessonBlock {
  type: "paragraph" | "code" | "callout" | "list";
  text?: string | null;
  callout_type?: "tip" | "warning" | "note" | null;
  items?: string[];
  language?: string;
  code?: string | null;
  expected_output?: string | null;
}

export interface LessonCheckpoint {
  concept_tag?: string | null;
  question_text: string;
  code_snippet?: string | null;
  options: string[];
  correct_answer: string;
  misconception_map?: Record<string, string>;
  explanation: string;
}

export interface LessonSection {
  order: number;
  title: string;
  purpose?: string;
  covers_objectives?: string[];
  blocks?: LessonBlock[];
  whiteboard?: unknown;
  diagnostic_check?: LessonCheckpoint | null;
  remediation_blocks?: LessonBlock[];
}

export interface LessonVersion {
  version_no?: number;
  state?: string;
  title?: string;
  introduction?: LessonBlock[];
  sections?: LessonSection[];
  conclusion?: LessonBlock[];
}

export interface LessonSummary {
  _id: string;
  topic: string;
  title?: string;
  course_id?: string;
  course_title?: string;
  module_id?: string;
  module_title?: string;
  programming_language?: string;
  grade_level?: string;
  target_duration_minutes?: number;
  status?: string;
  has_whiteboard?: boolean;
  section_count?: number;
  version_no?: number;
  is_practice?: boolean;
  is_group_lesson?: boolean;
  is_available?: boolean;
}

export interface LessonDocument extends LessonSummary {
  approved_version_no?: number | null;
  current_version_no?: number;
  versions?: LessonVersion[];
  sections?: LessonSection[];
  blocks?: LessonBlock[];
  whiteboard?: unknown;
  diagnostic_check?: LessonCheckpoint | null;
}

export interface PlayerLesson extends LessonSummary {
  version_no: number;
  sections: LessonSection[];
  introduction: LessonBlock[];
  conclusion: LessonBlock[];
}
