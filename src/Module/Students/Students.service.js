import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';
import studentsRepository from './Students.repository.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import authService from '../Auth/Auth.service.js';
import sessions from '../Auth/AuthSessions.repository.js';
import { generateUniqueStudentCode, addStudentCodeToRedis } from '../../Utils/redis.util.js';

class StudentsService {
  async createStudent(data) {
    if (data.name && (!data.first_name || data.first_name === 'Student')) {
      const parts = data.name.trim().split(' ');
      data.first_name = parts[0] || 'Student';
      data.last_name = parts.slice(1).join(' ') || parts[0];
    }
    delete data.name;

    if (!data.student_code) {
      data.student_code = await generateUniqueStudentCode(db);
    } else {
      await addStudentCodeToRedis(data.student_code);
    }
    if (!data.grade_level) {
      data.grade_level = 'Grade 8';
    }
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    if (data.school_name === undefined) {
      data.school_name = null;
    }
    if (data.profile_image === undefined) {
      data.profile_image = null;
    }
    if (data.national_id === undefined) {
      data.national_id = null;
    }
    if (data.address === undefined) {
      data.address = null;
    }
    if (data.gender === undefined) {
      data.gender = null;
    }

    // ── Parent / Guardian fields ──────────────────────────────────────────────
    if (data.parent_name === undefined) {
      data.parent_name = null;
    }
    if (data.parent_phone === undefined) {
      data.parent_phone = null;
    }
    if (data.parent_email === undefined) {
      data.parent_email = null;
    }
    if (data.parent_national_id === undefined) {
      data.parent_national_id = null;
    }
    if (data.parent_relation === undefined) {
      // e.g. 'father' | 'mother' | 'guardian'
      data.parent_relation = null;
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (data.email) {
      const existingStudent = await studentsRepository.findByEmail(data.email);
      if (existingStudent) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    if (!data.password) throw Object.assign(new Error('A password is required.'), { statusCode: 400 });
    const rawPassword = data.password;
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

    const createdStudent = await studentsRepository.create(data);

    const payload = {
      id: createdStudent._id,
      auth_version: createdStudent.auth_version || 0,
      name: `${createdStudent.first_name || ''} ${createdStudent.last_name || ''}`.trim(),
      email: createdStudent.email,
      role: 'student',
    };

    const { accessToken, refreshToken } = await authService.generateTokenPair(payload);

    return {
      student: createdStudent,
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const student = await studentsRepository.findByEmail(email);
    if (!student || student.is_active === false || !student.password_hash) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(student.password_hash, password);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: student._id,
      auth_version: student.auth_version || 0,
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
      email: student.email,
      role: 'student',
    };

    const { accessToken, refreshToken } = await authService.generateTokenPair(payload);

    const { password_hash, ...studentWithoutPassword } = student;

    return {
      student: studentWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async getAllStudents(filter) {
    return await studentsRepository.findAll(filter);
  }

  async getStudentById(id) {
    const student = await studentsRepository.findById(id);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return student;
  }

  async updateStudent(id, data) {
    // The student code is immutable once created and must remain fixed across all updates
    delete data.student_code;
    delete data.studentCode;

    if (data.email) {
      const existingStudent = await studentsRepository.findByEmail(data.email);
      if (existingStudent && existingStudent._id.toString() !== id.toString()) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const before = data.email ? await studentsRepository.findById(id) : null;
    const revokeSessions = Boolean(data.password || data.is_active === false || (data.email && data.email !== before?.email));
    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
    const student = await (revokeSessions ? studentsRepository.updateCredentials(id, data) : studentsRepository.update(id, data));
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    if (revokeSessions) await sessions.revokeUser(id, student.auth_version);
    return student;
  }

  async deleteStudent(id) {
    await sessions.revokeUser(id);
    const result = await studentsRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }

  async toggleFollow(currentStudentId, targetStudentId) {
    if (!targetStudentId) {
      const error = new Error('Target student ID is required');
      error.statusCode = 400;
      throw error;
    }
    if (currentStudentId.toString() === targetStudentId.toString()) {
      const error = new Error('You cannot follow yourself');
      error.statusCode = 400;
      throw error;
    }

    const targetStudent = await studentsRepository.findById(targetStudentId);
    if (!targetStudent) {
      const error = new Error('Target student not found');
      error.statusCode = 404;
      throw error;
    }

    const currentStudent = await studentsRepository.findById(currentStudentId);
    const following = (currentStudent.following || []).map(id => id.toString());
    const isFollowing = following.includes(targetStudentId.toString());

    if (isFollowing) {
      await studentsRepository.unfollowStudent(currentStudentId, targetStudentId);
      return {
        following: false,
        message: `Unfollowed ${targetStudent.first_name} ${targetStudent.last_name || ''}`.trim()
      };
    } else {
      await studentsRepository.followStudent(currentStudentId, targetStudentId);
      return {
        following: true,
        message: `Now following ${targetStudent.first_name} ${targetStudent.last_name || ''}`.trim()
      };
    }
  }

  async sendFriendRequest(currentStudentId, targetStudentId) {
    if (!targetStudentId) {
      const error = new Error('Target student ID is required');
      error.statusCode = 400;
      throw error;
    }
    if (currentStudentId.toString() === targetStudentId.toString()) {
      const error = new Error('You cannot send a friend request to yourself');
      error.statusCode = 400;
      throw error;
    }

    const targetStudent = await studentsRepository.findById(targetStudentId);
    if (!targetStudent) {
      const error = new Error('Target student not found');
      error.statusCode = 404;
      throw error;
    }

    const currentStudent = await studentsRepository.findById(currentStudentId);
    const friends = (currentStudent.friends || []).map(id => id.toString());
    if (friends.includes(targetStudentId.toString())) {
      const error = new Error('You are already friends with this student');
      error.statusCode = 400;
      throw error;
    }

    const sent = (currentStudent.friend_requests_sent || []).map(id => id.toString());
    if (sent.includes(targetStudentId.toString())) {
      const error = new Error('Friend request already sent');
      error.statusCode = 400;
      throw error;
    }

    await studentsRepository.sendFriendRequest(currentStudentId, targetStudentId);
    return {
      message: `Friend request sent to ${targetStudent.first_name} ${targetStudent.last_name || ''}`.trim()
    };
  }

  async acceptFriendRequest(currentStudentId, fromStudentId) {
    if (!fromStudentId) {
      const error = new Error('Student ID is required');
      error.statusCode = 400;
      throw error;
    }

    const currentStudent = await studentsRepository.findById(currentStudentId);
    const received = (currentStudent.friend_requests_received || []).map(id => id.toString());
    if (!received.includes(fromStudentId.toString())) {
      const error = new Error('No pending friend request from this student');
      error.statusCode = 404;
      throw error;
    }

    await studentsRepository.acceptFriendRequest(currentStudentId, fromStudentId);
    return {
      message: 'Friend request accepted successfully'
    };
  }

  async rejectFriendRequest(currentStudentId, fromStudentId) {
    if (!fromStudentId) {
      const error = new Error('Student ID is required');
      error.statusCode = 400;
      throw error;
    }

    await studentsRepository.rejectFriendRequest(currentStudentId, fromStudentId);
    return {
      message: 'Friend request rejected'
    };
  }

  async getMyFriends(studentId) {
    const student = await studentsRepository.findById(studentId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    const [friends, following, followers, requestsSent, requestsReceived] = await Promise.all([
      studentsRepository.findStudentsByIds(student.friends || []),
      studentsRepository.findStudentsByIds(student.following || []),
      studentsRepository.findStudentsByIds(student.followers || []),
      studentsRepository.findStudentsByIds(student.friend_requests_sent || []),
      studentsRepository.findStudentsByIds(student.friend_requests_received || [])
    ]);

    return {
      friends_count: friends.length,
      following_count: following.length,
      followers_count: followers.length,
      friends,
      following,
      followers,
      friend_requests_sent: requestsSent,
      friend_requests_received: requestsReceived
    };
  }

  async getFollowing(studentId) {
    const student = await studentsRepository.findById(studentId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    const following = await studentsRepository.findStudentsByIds(student.following || []);
    return { count: following.length, following };
  }

  async getFollowers(studentId) {
    const student = await studentsRepository.findById(studentId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    const followers = await studentsRepository.findStudentsByIds(student.followers || []);
    return { count: followers.length, followers };
  }

  async searchStudents(currentStudentId, query) {
    const students = await studentsRepository.searchStudents(query, currentStudentId);
    const currentStudent = await studentsRepository.findById(currentStudentId);
    const friends = (currentStudent?.friends || []).map(id => id.toString());
    const sent = (currentStudent?.friend_requests_sent || []).map(id => id.toString());
    const received = (currentStudent?.friend_requests_received || []).map(id => id.toString());

    return students.map(s => {
      const sIdStr = s._id.toString();
      let friendship_status = 'none';
      if (friends.includes(sIdStr)) friendship_status = 'friend';
      else if (sent.includes(sIdStr)) friendship_status = 'sent';
      else if (received.includes(sIdStr)) friendship_status = 'received';

      return {
        ...s,
        friendship_status
      };
    });
  }

  async getDashboardSummary(studentId) {
    const student = await studentsRepository.findById(studentId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    const sId = new ObjectId(student._id);

    // 1. Continue Learning: active session or first enrolled course lesson
    let continueLearning = await db.collection('student_lesson_sessions').findOne(
      { student_id: sId, status: 'active' },
      { sort: { updated_at: -1 } }
    );

    if (!continueLearning && student.enrolled_courses && student.enrolled_courses.length > 0) {
      const courseIds = student.enrolled_courses.map(id => typeof id === 'string' ? new ObjectId(id) : id);
      const firstCourse = await db.collection('courses').findOne({ _id: { $in: courseIds } });
      const firstLesson = await db.collection('lessons').findOne({ course_id: { $in: courseIds } });
      if (firstLesson) {
        continueLearning = {
          _id: firstLesson._id,
          lesson_id: firstLesson._id.toString(),
          lesson_title: firstLesson.topic || firstLesson.title || 'Lesson',
          course_name: firstCourse?.title || 'Enrolled Course',
          current_section_order: 1,
          total_sections: (firstLesson.sections && firstLesson.sections.length) ? firstLesson.sections.length : 4,
          status: 'available',
          course_id: firstLesson.course_id?.toString() || ''
        };
      }
    }

    // 2. Daily Goal & Activity
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todaySessions, todayQuizzes, todayAssessments] = await Promise.all([
      db.collection('student_lesson_sessions').countDocuments({
        student_id: sId,
        completed_at: { $gte: startOfDay }
      }),
      db.collection('quiz_attempts').countDocuments({
        student_id: sId,
        completed_at: { $gte: startOfDay }
      }),
      db.collection('assessment_submissions').countDocuments({
        student_id: sId,
        submitted_at: { $gte: startOfDay }
      })
    ]);

    const completedToday = todaySessions + todayQuizzes + todayAssessments;
    const dailyGoal = {
      target: 2,
      completed_today: completedToday
    };

    // 3. XP and Level
    const totalQuizAttempts = await db.collection('quiz_attempts').countDocuments({ student_id: sId });
    const totalAssessmentSubs = await db.collection('assessment_submissions').countDocuments({ student_id: sId });
    const lessonsCompletedCount = student.lessons_completed || 0;
    const xp = (lessonsCompletedCount * 50) + (totalQuizAttempts * 25) + (totalAssessmentSubs * 50);
    const level = Math.max(1, Math.floor(xp / 100) + 1);

    // 4. Recent Achievements
    const studentAchievements = student.achievements || [];
    const recentAchievements = studentAchievements.length > 0
      ? [...studentAchievements].reverse().slice(0, 4)
      : await db.collection('achievements')
          .find({ student_id: sId })
          .sort({ awarded_at: -1 })
          .limit(4)
          .toArray();

    // 5. Recent Sessions / Activity
    const [recentLessonSessions, recentQuizAttempts, recentAssessments] = await Promise.all([
      db.collection('student_lesson_sessions')
        .find({ student_id: sId })
        .sort({ updated_at: -1, created_at: -1 })
        .limit(5)
        .toArray(),
      db.collection('quiz_attempts')
        .find({ student_id: sId })
        .sort({ completed_at: -1 })
        .limit(5)
        .toArray(),
      db.collection('assessment_submissions')
        .find({ student_id: sId })
        .sort({ submitted_at: -1 })
        .limit(5)
        .toArray()
    ]);

    const unifiedSessions = [
      ...recentLessonSessions.map(s => ({
        id: s._id.toString(),
        title: s.lesson_title || 'Lesson Session',
        course_name: s.course_name || 'Coding',
        status: s.status,
        type: 'lesson',
        date: s.completed_at || s.created_at || new Date(),
        detail: `Section ${s.current_section_order || 1} of ${s.total_sections || 4}`
      })),
      ...recentQuizAttempts.map(q => ({
        id: q._id.toString(),
        title: q.quiz_title || 'Diagnostic Quiz',
        course_name: 'Quiz',
        status: 'completed',
        type: 'quiz',
        date: q.completed_at || new Date(),
        detail: `Score: ${q.score}/${q.total_questions || 10}`
      })),
      ...recentAssessments.map(a => ({
        id: a._id.toString(),
        title: a.assessment_title || 'Course Assessment',
        course_name: 'Assessment',
        status: 'completed',
        type: 'assessment',
        date: a.submitted_at || new Date(),
        detail: `Score: ${a.score}% (${a.passed ? 'Passed' : 'Needs Review'})`
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // 6. Personalized greeting
    let greeting = `Welcome back, ${student.first_name}!`;
    if (student.current_streak > 0) {
      greeting = `You're on a ${student.current_streak}-day streak! Keep up the momentum.`;
    } else if (continueLearning) {
      greeting = `Ready to pick up with ${continueLearning.lesson_title}? Let's dive in.`;
    } else {
      greeting = `Ready to start your learning journey today? Explore your courses below.`;
    }

    return {
      student: {
        _id: student._id,
        first_name: student.first_name,
        last_name: student.last_name,
        student_code: student.student_code,
        grade_level: student.grade_level,
        current_streak: student.current_streak || 0,
        longest_streak: student.longest_streak || 0,
        lessons_completed: lessonsCompletedCount,
        xp,
        level,
        personalized_greeting: greeting
      },
      continue_learning: continueLearning,
      daily_goal: dailyGoal,
      struggling_concepts: student.struggling_concepts || [],
      recent_achievements: recentAchievements,
      recent_sessions: unifiedSessions
    };
  }
}

export default new StudentsService();
