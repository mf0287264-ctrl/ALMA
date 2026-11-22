import quizzesRepository from './Quizzes.repository.js';
import coursesRepository from '../Courses/Courses.repository.js';
import studentsRepository from '../Students/Students.repository.js';

class QuizzesService {
  async createQuiz(data) {
    return await quizzesRepository.create(data);
  }

  async getAllQuizzes(filter, user = null) {
    let student = null;
    if (user?._id) {
      student = await studentsRepository.findById(user._id);
    }

    const query = { ...filter };

    // If logged in student, strictly show quizzes for their enrolled courses
    if (student) {
      const enrolledIds = student.enrolled_courses || [];
      if (enrolledIds.length === 0) {
        return [];
      }
      query.course_id = { $in: enrolledIds };
    }

    const list = await quizzesRepository.findAll(query);
    const allCourses = await coursesRepository.findAll({});
    const coursesMap = new Map();
    allCourses.forEach((c) => coursesMap.set(c._id.toString(), c.title));

    // Fetch user attempts to attach live scores and progress
    let userAttempts = [];
    if (student) {
      userAttempts = await quizzesRepository.findAttemptsByStudent(student._id);
    }
    const attemptsMap = new Map();
    userAttempts.forEach((att) => {
      attemptsMap.set(att.quiz_id.toString(), att);
    });

    return list.map((q) => {
      const cId = q.course_id ? q.course_id.toString() : null;
      const att = attemptsMap.get(q._id.toString());
      return {
        ...q,
        course_title: cId ? coursesMap.get(cId) || 'Platform Course' : 'Platform Course',
        has_attempted: Boolean(att),
        user_score: att ? att.score_percent : null,
      };
    });
  }

  async getQuizById(id) {
    const quiz = await quizzesRepository.findById(id);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }

    let courseTitle = 'Platform Course';
    if (quiz.course_id) {
      const course = await coursesRepository.findById(quiz.course_id);
      if (course) courseTitle = course.title;
    }

    return {
      ...quiz,
      course_title: courseTitle,
    };
  }

  async recordAttempt(quizId, studentId, data) {
    const quiz = await quizzesRepository.findById(quizId);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }

    const attempt = await quizzesRepository.saveAttempt({
      ...data,
      student_id: studentId,
      quiz_id: quiz._id,
      course_id: quiz.course_id,
    });

    return attempt;
  }

  async getMyAttempt(quizId, studentId) {
    const attempt = await quizzesRepository.findLatestAttempt(studentId, quizId);
    return attempt;
  }

  async updateQuiz(id, data) {
    const quiz = await quizzesRepository.update(id, data);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }
    return quiz;
  }

  async deleteQuiz(id) {
    const quiz = await quizzesRepository.delete(id);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }
    return quiz;
  }
}

export default new QuizzesService();
