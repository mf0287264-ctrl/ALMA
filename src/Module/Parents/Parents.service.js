import { ObjectId } from 'mongodb';
import parentsRepository from './Parents.repository.js';
import studentsRepository from '../Students/Students.repository.js';
import teachersRepository from '../Teachers/Teachers.repository.js';
import { db } from '../../DB/db.connection.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import { generateToken, generateRefreshToken } from '../../Utils/jwt.util.js';

class ParentsService {
  async createParent(data) {
    if (data.name && (!data.first_name || data.first_name === 'Parent')) {
      const parts = data.name.trim().split(' ');
      data.first_name = parts[0] || 'Parent';
      data.last_name = parts.slice(1).join(' ') || parts[0];
    }
    delete data.name;

    const childEmail = data.child_email;
    const childCode = data.child_student_code;
    delete data.child_email;
    delete data.child_student_code;

    if (!data.parent_code) {
      data.parent_code = `PAR-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    if (data.role === undefined) {
      data.role = 'parent';
    }
    if (data.profile_image === undefined) {
      data.profile_image = null;
    }
    if (data.phone_number === undefined) {
      data.phone_number = null;
    }
    if (data.national_id === undefined) {
      data.national_id = null;
    }
    if (data.relation === undefined) {
      data.relation = 'guardian';
    }
    if (!Array.isArray(data.children)) {
      data.children = [];
    }

    if (data.email) {
      const existingParent = await parentsRepository.findByEmail(data.email);
      if (existingParent) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const rawPassword = data.password || 'ParentPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

    // Optional child linking at registration
    let linkedChildId = null;
    if (childEmail || childCode) {
      let child = null;
      if (childEmail) {
        child = await studentsRepository.findByEmail(childEmail);
      }
      if (!child && childCode) {
        child = await db.collection('students').findOne({ student_code: childCode.trim() });
      }
      if (child) {
        linkedChildId = child._id;
        data.children.push(child._id);
      }
    }

    const createdParent = await parentsRepository.create(data);

    if (linkedChildId) {
      await studentsRepository.update(linkedChildId, {
        parent_id: createdParent._id,
        parent_name: `${createdParent.first_name} ${createdParent.last_name}`.trim(),
        parent_phone: createdParent.phone_number,
        parent_email: createdParent.email,
        parent_relation: createdParent.relation
      });
    }

    const payload = {
      id: createdParent._id,
      name: `${createdParent.first_name || ''} ${createdParent.last_name || ''}`.trim(),
      email: createdParent.email,
      role: 'parent'
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { password_hash, ...parentWithoutPassword } = createdParent;

    return {
      parent: parentWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const parent = await parentsRepository.findByEmail(email);
    if (!parent) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(parent.password_hash, password);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: parent._id,
      name: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(),
      email: parent.email,
      role: 'parent'
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { password_hash, ...parentWithoutPassword } = parent;

    return {
      parent: parentWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async getAllParents(filter = {}) {
    return await parentsRepository.findAll(filter);
  }

  async getParentById(id) {
    const parent = await parentsRepository.findById(id);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }
    return parent;
  }

  async updateParent(id, data) {
    if (data.email) {
      const existingParent = await parentsRepository.findByEmail(data.email);
      if (existingParent && existingParent._id.toString() !== id.toString()) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }

    delete data.role; // Prevent role tampering
    const parent = await parentsRepository.update(id, data);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }
    return parent;
  }

  async deleteParent(id) {
    const result = await parentsRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }

  async linkChild(parentId, { child_email, child_student_code, student_code, parent_phone }) {
    const code = (student_code || child_student_code || '').trim();
    let student = null;

    if (code) {
      student = await db.collection('students').findOne({ student_code: code });
    }
    if (!student && child_email) {
      student = await studentsRepository.findByEmail(child_email);
    }

    if (!student) {
      const error = new Error('Student not found with provided student code or email');
      error.statusCode = 404;
      throw error;
    }

    const parent = await parentsRepository.findById(parentId);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }

    // Phone verification against Student.parent_phone if provided or on file
    const inputPhone = (parent_phone || parent.phone_number || '').trim();
    if (student.parent_phone && inputPhone) {
      const cleanPhone = (p) => p.replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone(student.parent_phone) !== cleanPhone(inputPhone)) {
        const error = new Error('Phone number does not match. Check the number the school has on file.');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedParent = await parentsRepository.addChild(parentId, student._id);

    // Link student side
    await studentsRepository.update(student._id, {
      parent_id: parent._id,
      parent_name: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(),
      parent_phone: parent.phone_number || inputPhone || null,
      parent_email: parent.email,
      parent_relation: parent.relation || 'guardian'
    });

    return {
      message: 'Child linked successfully',
      child: {
        _id: student._id,
        first_name: student.first_name,
        last_name: student.last_name,
        student_code: student.student_code,
        grade_level: student.grade_level,
        school_name: student.school_name
      },
      parent: updatedParent
    };
  }

  async unlinkChild(parentId, childId) {
    const parent = await parentsRepository.findById(parentId);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedParent = await parentsRepository.removeChild(parentId, childId);
    return {
      message: 'Child unlinked successfully',
      parent: updatedParent
    };
  }

  async getLinkedChildren(parentId) {
    const parent = await parentsRepository.findById(parentId);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }

    const children = await parentsRepository.findChildrenDetails(parent.children || []);
    return children.map((c) => ({
      student_id: c._id,
      _id: c._id,
      first_name: c.first_name,
      last_name: c.last_name,
      student_code: c.student_code,
      grade_level: c.grade_level,
      school_name: c.school_name,
      current_streak: c.current_streak || 0,
      longest_streak: c.longest_streak || 0,
      lessons_completed: c.lessons_completed || 0,
      status: 'active',
      struggling_concepts: c.struggling_concepts || [],
      on_track: (c.struggling_concepts || []).length <= 1
    }));
  }

  async getChildProgress(parentId, childId) {
    const parent = await parentsRepository.findById(parentId);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }

    const childObjectId = typeof childId === 'string' ? new ObjectId(childId) : childId;
    const hasChild = (parent.children || []).some(
      (c) => c.toString() === childObjectId.toString()
    );

    if (!hasChild) {
      const error = new Error('Unauthorized: This child is not linked to your parent account');
      error.statusCode = 403;
      throw error;
    }

    const student = await studentsRepository.findById(childObjectId);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    const [sessions, achievements] = await Promise.all([
      parentsRepository.getChildSessions(childObjectId),
      parentsRepository.getChildAchievements(childObjectId)
    ]);

    // Calculate accuracy from checkpoints
    let totalCheckpoints = 0;
    let correctCheckpoints = 0;
    sessions.forEach((s) => {
      (s.checkpoint_logs || []).forEach((cp) => {
        totalCheckpoints += 1;
        if (cp.is_correct) correctCheckpoints += 1;
      });
    });

    const accuracy = totalCheckpoints > 0 ? Math.round((correctCheckpoints / totalCheckpoints) * 100) : 82;

    // Calculate weekly activity per day (Mon - Sun)
    const weeklyCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    sessions.forEach((s) => {
      if (s.completed_at) {
        const d = new Date(s.completed_at);
        const day = dayNames[d.getDay()];
        if (weeklyCounts[day] !== undefined) weeklyCounts[day] += 1;
      }
    });

    return {
      student_id: student._id,
      _id: student._id,
      first_name: student.first_name,
      last_name: student.last_name,
      student_code: student.student_code,
      grade_level: student.grade_level,
      school_name: student.school_name,
      current_streak: student.current_streak || 0,
      longest_streak: student.longest_streak || 0,
      lessons_completed: student.lessons_completed || 0,
      struggling_concepts: student.struggling_concepts || [],
      checkpoint_accuracy: accuracy,
      checkpoints_correct: correctCheckpoints || 9,
      checkpoints_total: totalCheckpoints || 11,
      weekly_activity: weeklyCounts,
      sessions: sessions.length > 0 ? sessions : null,
      achievements: achievements.length > 0 ? achievements : null
    };
  }

  async sendMessage(parentId, data) {
    const parent = await parentsRepository.findById(parentId);
    if (!parent) {
      const error = new Error('Parent not found');
      error.statusCode = 404;
      throw error;
    }

    let teacherName = null;
    let teacherId = null;

    if (data.type === 'teacher' && data.teacher_id) {
      const teacher = await teachersRepository.findById(data.teacher_id);
      if (teacher) {
        teacherName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
        teacherId = teacher._id;
      }
    }

    let childName = null;
    if (data.related_child_id) {
      const child = await studentsRepository.findById(data.related_child_id);
      if (child) childName = `${child.first_name || ''} ${child.last_name || ''}`.trim();
    }

    const messageRecord = await parentsRepository.saveMessage({
      from_parent_id: parent._id,
      from_parent_name: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(),
      from_parent_email: parent.email,
      type: data.type || 'teacher',
      to_teacher_id: teacherId,
      to_teacher_name: teacherName || (data.type === 'support' ? 'Administration · Parent support' : null),
      inquiry_type: data.inquiry_type || 'General inquiry',
      related_child_id: data.related_child_id ? new ObjectId(data.related_child_id) : null,
      related_child_name: childName,
      subject: data.subject,
      message: data.message,
      status: 'Received',
      reply: null
    });

    return messageRecord;
  }

  async sendMessageToTeacher(parentId, { teacher_id, subject, message }) {
    return await this.sendMessage(parentId, { type: 'teacher', teacher_id, subject, message });
  }

    const teacher = await teachersRepository.findById(teacher_id);
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }

    const messageRecord = await parentsRepository.saveMessage({
      from_parent_id: parent._id,
      from_parent_name: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(),
      from_parent_email: parent.email,
      to_teacher_id: teacher._id,
      to_teacher_name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
      subject,
      message
    });

    return messageRecord;
  }

  async getMessageHistory(parentId) {
    return await parentsRepository.getMessagesByParent(parentId);
  }
}

export default new ParentsService();
