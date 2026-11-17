import studentsRepository from './Students.repository.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import { generateToken, generateRefreshToken } from '../../Utils/jwt.util.js';

class StudentsService {
  async createStudent(data) {
    if (data.name && (!data.first_name || data.first_name === 'Student')) {
      const parts = data.name.trim().split(' ');
      data.first_name = parts[0] || 'Student';
      data.last_name = parts.slice(1).join(' ') || parts[0];
    }
    delete data.name;

    if (!data.student_code) {
      data.student_code = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
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

    const rawPassword = data.password || 'StudentPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

    const createdStudent = await studentsRepository.create(data);

    const payload = {
      id: createdStudent._id,
      name: `${createdStudent.first_name || ''} ${createdStudent.last_name || ''}`.trim(),
      email: createdStudent.email,
      role: 'student',
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
    if (!student) {
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
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
      email: student.email,
      role: 'student',
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
    if (data.email) {
      const existingStudent = await studentsRepository.findByEmail(data.email);
      if (existingStudent && existingStudent._id.toString() !== id.toString()) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
    const student = await studentsRepository.update(id, data);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return student;
  }

  async deleteStudent(id) {
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
}

export default new StudentsService();
