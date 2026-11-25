import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';
import achievementsRepository from './Achievements.repository.js';
import studentsRepository from '../Students/Students.repository.js';
import { canStudyLesson } from '../../Security/access.js';
import { httpError } from '../../Security/input.js';
import { activeLessonVersion, isPublishedLesson, publishedLessonDocument } from '../../Whiteboard/lessonSummary.js';

function getCourseAchievementMetadata(courseTitle) {
  const lower = (courseTitle || '').toLowerCase();
  if (lower.includes('python')) {
    return {
      title: 'Python Pioneer',
      description: 'Mastered Python syntax, variables, conditionals, loops, and functions.',
      badge_icon: 'trophy',
      badge_color: 'bg-[#ffa11f]'
    };
  }
  if (lower.includes('data')) {
    return {
      title: 'Data Structurer',
      description: 'Conquered lists, indexing, slicing, and dictionary key-value data.',
      badge_icon: 'award',
      badge_color: 'bg-[#59b8eb]'
    };
  }
  if (lower.includes('web')) {
    return {
      title: 'Web Architect',
      description: 'Mastered web architecture, responsive layouts, and DOM structure.',
      badge_icon: 'sparkles',
      badge_color: 'bg-[#118a80]'
    };
  }
  if (lower.includes('algorithm')) {
    return {
      title: 'Algorithmic Master',
      description: 'Formulated algorithmic pseudocode, solved decomposition, and binary search.',
      badge_icon: 'flame',
      badge_color: 'bg-[#f25c78]'
    };
  }
  if (lower.includes('logic')) {
    return {
      title: 'Logic Wizard',
      description: 'Solved complex boolean truth tables, conditional branching, and problem decomposition.',
      badge_icon: 'zap',
      badge_color: 'bg-[#ffd84a]'
    };
  }
  return {
    title: `${courseTitle} Scholar`,
    description: `Successfully mastered all curriculum modules and lessons in ${courseTitle}.`,
    badge_icon: 'trophy',
    badge_color: 'bg-[#ffa11f]'
  };
}

class AchievementsService {
  /**
   * Get achievements for the logged-in student.
   * Returns unlocked course achievements and available locked course achievements with progress.
   */
  async getMyAchievements(user) {
    if (!user?._id) {
      return { unlocked: [], available: [] };
    }

    const studentId = new ObjectId(user._id);
    const student = await db.collection('students').findOne({ _id: studentId });
    if (!student) {
      return { unlocked: [], available: [] };
    }

    const earnedList = student.achievements || [];
    const completedCourseIds = (student.completed_courses || []).map((id) => id.toString());
    const completedLessonIds = (student.completed_lessons || []).map((id) => id.toString());

    // Fetch all courses in platform
    const courses = await db.collection('courses').find({}).toArray();

    const courseCatalogAchievements = await Promise.all(
      courses.map(async (course) => {
        const cIdStr = course._id.toString();
        const courseLessons = await db
          .collection('lessons')
          .find({ course_id: course._id }, { projection: { _id: 1, topic: 1 } })
          .toArray();

        const totalLessons = courseLessons.length;
        const finishedLessonsCount = courseLessons.filter((l) =>
          completedLessonIds.includes(l._id.toString())
        ).length;

        const isCompleted =
          completedCourseIds.includes(cIdStr) ||
          earnedList.some((a) => a.course_id && a.course_id.toString() === cIdStr);

        const earnedMatch = earnedList.find(
          (a) => a.course_id && a.course_id.toString() === cIdStr
        );

        const meta = getCourseAchievementMetadata(course.title);

        return {
          course_id: cIdStr,
          course_title: course.title,
          title: earnedMatch?.title || meta.title,
          description: earnedMatch?.description || meta.description,
          badge_icon: earnedMatch?.badge_icon || meta.badge_icon,
          badge_color: earnedMatch?.badge_color || meta.badge_color,
          category: 'Course Completion',
          is_unlocked: isCompleted,
          awarded_at: earnedMatch?.awarded_at || (isCompleted ? new Date() : null),
          progress: {
            completed_lessons: isCompleted ? totalLessons : finishedLessonsCount,
            total_lessons: totalLessons,
            percentage:
              isCompleted || totalLessons === 0
                ? 100
                : Math.round((finishedLessonsCount / totalLessons) * 100)
          }
        };
      })
    );

    const unlocked = courseCatalogAchievements.filter((a) => a.is_unlocked);
    const locked = courseCatalogAchievements.filter((a) => !a.is_unlocked);

    return {
      unlocked_count: unlocked.length,
      locked_count: locked.length,
      unlocked,
      available: courseCatalogAchievements
    };
  }

  /**
   * Check if student completed all lessons for a course (or explicit trigger)
   * and award the specific course achievement to this student.
   */
  async checkAndAwardCourseCompletion(studentIdStr, courseIdStr) {
    const studentId = new ObjectId(studentIdStr);
    const courseId = new ObjectId(courseIdStr);

    const [student, course] = await Promise.all([
      db.collection('students').findOne({ _id: studentId }),
      db.collection('courses').findOne({ _id: courseId })
    ]);

    if (!student || !course) {
      return { awarded: false, message: 'Student or Course not found' };
    }
    if (course.status !== 'published' || !(student.enrolled_courses || []).some(id => String(id) === String(courseId))) throw httpError(403, 'Enroll in the published course first.');

    const cIdStr = course._id.toString();
    const completedCourses = (student.completed_courses || []).map((id) => id.toString());
    const existingAchievements = student.achievements || [];

    const alreadyHas =
      completedCourses.includes(cIdStr) ||
      existingAchievements.some((a) => a.course_id && a.course_id.toString() === cIdStr);

    if (alreadyHas) {
      return {
        awarded: false,
        already_earned: true,
        message: `Achievement for ${course.title} has already been awarded.`
      };
    }

    // Check course lessons
    const courseLessons = await db
      .collection('lessons')
      .find({ course_id: { $in: [course._id, String(course._id)] } })
      .toArray();

    const courseLessonIds = courseLessons.filter(l => l.status !== 'draft' && isPublishedLesson(l)).map((l) => l._id.toString());
    const completedLessonIds = (student.completed_lessons || []).map((id) => id.toString());

    // Also check completed student_lesson_sessions
    const completedSessions = await db
      .collection('student_lesson_sessions')
      .find({
        student_id: studentId,
        lesson_id: { $in: courseLessonIds },
        status: 'completed'
      })
      .toArray();

    const sessionCompletedLessonIds = completedSessions.map((s) => s.lesson_id.toString());
    const allStudentCompletedLessons = new Set([
      ...completedLessonIds,
      ...sessionCompletedLessonIds
    ]);

    const allFinished =
      courseLessonIds.length > 0 &&
      courseLessonIds.every((lId) => allStudentCompletedLessons.has(lId));

    if (!allFinished) {
      return {
        awarded: false,
        course_completed: false,
        completed_count: courseLessonIds.filter((id) => allStudentCompletedLessons.has(id)).length,
        total_lessons: courseLessonIds.length,
        message: 'Course has remaining lessons to complete.'
      };
    }

    // Award specific achievement!
    const meta = getCourseAchievementMetadata(course.title);
    const achievementDoc = {
      achievement_id: `course_completed_${cIdStr}`,
      course_id: course._id,
      course_title: course.title,
      title: meta.title,
      description: meta.description,
      badge_icon: meta.badge_icon,
      badge_color: meta.badge_color,
      category: 'Course Completion',
      awarded_at: new Date()
    };

    // Update student document in MongoDB
    const award = await db.collection('students').updateOne(
      { _id: studentId, completed_courses: { $nin: [courseId, String(courseId)] }, 'achievements.course_id': { $nin: [courseId, String(courseId)] } },
      {
        $addToSet: {
          completed_courses: course._id,
          achievements: achievementDoc
        },
        $inc: { xp: 150 }
      }
    );
    if (award.modifiedCount !== 1) return { awarded: false, already_earned: true };

    // Also insert into achievements collection
    await db.collection('achievements').insertOne({
      student_id: studentId,
      ...achievementDoc,
      created_at: new Date(),
      updated_at: new Date()
    });

    return {
      awarded: true,
      course_completed: true,
      achievement: achievementDoc,
      message: `Congratulations! You mastered ${course.title} and earned the "${meta.title}" achievement!`
    };
  }

  /**
   * Complete a single lesson and automatically trigger course check
   */
  async completeLesson(studentIdStr, lessonIdStr, proof = {}) {
    const studentId = new ObjectId(studentIdStr);
    const lessonId = new ObjectId(lessonIdStr);

    const lesson = await db.collection('lessons').findOne({ _id: lessonId });
    if (!lesson) throw httpError(404, 'Lesson not found.');
    const student = await studentsRepository.findById(studentIdStr);
    if (!student || !await canStudyLesson({ ...student, role: 'student' }, lesson)) throw httpError(403, 'You do not have access to this lesson.');
    const version = activeLessonVersion(publishedLessonDocument(lesson));
    const sections = version?.sections || lesson.sections || [];
    if (sections.some(s => s.diagnostic_check)) {
      if (proof.version_no !== (version?.version_no || lesson.current_version_no || 1)) throw httpError(409, 'Reload the current lesson version before completing it.');
      if (!proof.answers || typeof proof.answers !== 'object' || Array.isArray(proof.answers)) throw httpError(400, 'Complete the lesson checkpoints first.');
      if (Object.keys(proof.answers).some(key => !/^\d+$/.test(key) || Number(key) >= sections.length)) throw httpError(400, 'Invalid lesson checkpoint.');
      for (const [i, section] of sections.entries()) {
        if (section.diagnostic_check && proof.answers[i] !== section.diagnostic_check.correct_answer) throw httpError(422, 'Complete every lesson checkpoint before finishing.');
      }
    }

    // Add to completed_lessons
    const completion = await db.collection('students').updateOne(
      { _id: studentId, completed_lessons: { $nin: [lessonId, String(lessonId)] } },
      {
        $addToSet: { completed_lessons: lessonId },
        $inc: { lessons_completed: 1, xp: 50 }
      }
    );

    // Mark or create completed session
    await db.collection('student_lesson_sessions').updateOne(
      { student_id: studentId, lesson_id: lessonId.toString() },
      {
        $set: {
          status: 'completed',
          completed_at: new Date(),
          lesson_title: lesson.topic || lesson.title,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );

    // Check if course is completed
    let courseResult = null;
    if (lesson.course_id && (student.enrolled_courses || []).some(id => String(id) === String(lesson.course_id))) {
      courseResult = await this.checkAndAwardCourseCompletion(
        studentIdStr,
        lesson.course_id.toString()
      );
    }

    return {
      lesson_completed: true,
      already_completed: completion.modifiedCount !== 1,
      course_awarded: courseResult?.awarded || false,
      achievement: courseResult?.achievement || null,
      message: courseResult?.awarded
        ? courseResult.message
        : 'Lesson completed successfully!'
    };
  }
}

export default new AchievementsService();
