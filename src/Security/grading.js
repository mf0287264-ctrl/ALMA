import { httpError } from "./input.js";

export const questionId = (question, index) => String(question._id ?? index);

function answersFor(questions, answers, quiz) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers))
    throw httpError(400, "Submit answers keyed by question identifier.");
  const known = new Set(questions.map(questionId));
  for (const [id, answer] of Object.entries(answers)) {
    if (!known.has(id))
      throw httpError(400, "An answer refers to an unknown question.");
    const question = questions.find((q, i) => questionId(q, i) === id);
    if (
      quiz
        ? !Number.isInteger(answer) ||
          answer < 0 ||
          answer >= question.options.length
        : typeof answer !== "string" || answer.length > 10000
    )
      throw httpError(400, "Invalid answer format.");
    if (
      !quiz &&
      question.question_type === "mcq" &&
      !question.options?.includes(answer)
    )
      throw httpError(400, "Choose an available answer.");
  }
  return answers;
}

export function gradeAssessment(assessment, supplied) {
  const questions = assessment.questions || [];
  if (!questions.length || questions.length > 200)
    throw httpError(422, "This assessment has no valid question set.");
  const answers = answersFor(questions, supplied, false);
  let earned = 0,
    total = 0,
    correct = 0;
  const breakdown = questions.map((q, i) => {
    const points = Number(q.points ?? 10);
    if (!Number.isFinite(points) || points <= 0 || points > 1000)
      throw httpError(422, "Invalid question points.");
    const selected = answers[questionId(q, i)];
    // Text answers use an exact comparison; arbitrary submitted code is never executed.
    const isCorrect =
      typeof selected === "string" &&
      selected.trim() === String(q.correct_answer).trim();
    total += points;
    if (isCorrect) {
      earned += points;
      correct++;
    }
    return {
      question_id: questionId(q, i),
      question_text: q.question_text,
      selected_answer: selected ?? "Not answered",
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      points,
      explanation: q.explanation || "",
    };
  });
  const percent = Math.round((earned / total) * 100);
  const passing = Math.min(
    100,
    Math.max(0, Number(assessment.passing_score ?? 60)),
  );
  return {
    title: assessment.title,
    earned_points: earned,
    total_points: total,
    score_percent: percent,
    correct_count: correct,
    total_questions: questions.length,
    passing_score: passing,
    passed: percent >= passing,
    breakdown,
  };
}

export function gradeQuiz(quiz, supplied) {
  const questions = quiz.questions || [];
  if (!questions.length || questions.length > 200)
    throw httpError(422, "This quiz has no valid question set.");
  const answers = answersFor(questions, supplied, true);
  const breakdown = questions.map((q, i) => ({
    question_id: questionId(q, i),
    selected_option_index: answers[questionId(q, i)] ?? null,
    correct_option_index: q.correct_option_index,
    is_correct: answers[questionId(q, i)] === q.correct_option_index,
    explanation: q.explanation || "",
  }));
  const score = breakdown.filter((q) => q.is_correct).length;
  return {
    score,
    total_questions: questions.length,
    score_percent: Math.round((score / questions.length) * 100),
    answers,
    breakdown,
  };
}

export function questionsForViewer(document, user) {
  if (!document || ["teacher", "admin"].includes(user?.role)) return document;
  return {
    ...document,
    questions: (document.questions || []).map((q, i) => {
      const { correct_answer, correct_option_index, explanation, ...safe } = q;
      return { ...safe, _id: questionId(q, i) };
    }),
  };
}
