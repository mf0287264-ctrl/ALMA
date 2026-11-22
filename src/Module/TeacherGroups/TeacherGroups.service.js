import crypto from "crypto";
import teacherGroupsRepository from "./TeacherGroups.repository.js";
import Student from "../../DB/Models/Student.model.js";
import Teacher from "../../DB/Models/Teacher.model.js";

class TeacherGroupsService {
  _generateClassCode(prefix = "ALMA") {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }

  async createGroup(teacherUser, data) {
    if (!teacherUser || teacherUser.role !== "teacher") {
      const error = new Error("Only teachers can create class groups");
      error.statusCode = 403;
      throw error;
    }

    // Generate unique class code
    let classCode = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      classCode = this._generateClassCode();
      const existing = await teacherGroupsRepository.findByCode(classCode);
      if (!existing) isUnique = true;
      attempts++;
    }

    const teacherName =
      teacherUser.first_name || teacherUser.last_name
        ? `${teacherUser.first_name || ""} ${teacherUser.last_name || ""}`.trim()
        : teacherUser.name || "Teacher";

    const payload = {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : "",
      subject: data.subject ? data.subject.trim() : "Computer Science & Programming",
      grade_level: data.grade_level ? data.grade_level.trim() : "Grade 8",
      class_code: classCode,
      teacher_id: teacherUser._id,
      teacher_name: teacherName,
      students: [],
      lessons: [
        {
          title: "Introduction to Iteration & For Loops",
          topic: "For Loops and Iteration",
          duration_minutes: 15,
          programming_language: "Python",
        },
      ],
      tasks: [
        {
          title: "Complete Python For Loops Diagnostic Quiz",
          description: "Practice the 3 range() exercises before our next lab session.",
          status: "assigned",
        },
      ],
      messages: [
        {
          sender_id: teacherUser._id,
          sender_name: teacherName,
          sender_role: "teacher",
          message: `Welcome to ${data.name}! Use class code ${classCode} to invite your classmates. Check the lessons and tasks tab for this week's assignments.`,
        },
      ],
    };

    return await teacherGroupsRepository.create(payload);
  }

  async getMyGroups(currentUser) {
    if (!currentUser) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    if (currentUser.role === "teacher") {
      return await teacherGroupsRepository.findByTeacherId(currentUser._id);
    } else {
      return await teacherGroupsRepository.findByStudentId(currentUser._id);
    }
  }

  async getGroupDetails(currentUser, groupId) {
    const group = await teacherGroupsRepository.findById(groupId);
    if (!group) {
      const error = new Error("Class group not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization: teacher or enrolled student
    const isTeacher =
      group.teacher_id && group.teacher_id._id.toString() === currentUser._id.toString();
    const isStudent = group.students.some(
      (s) => s._id.toString() === currentUser._id.toString()
    );

    if (!isTeacher && !isStudent && currentUser.role !== "admin") {
      const error = new Error("You are not a member of this class group");
      error.statusCode = 403;
      throw error;
    }

    return group;
  }

  async joinGroupWithCode(studentUser, rawCode) {
    if (!rawCode || !rawCode.trim()) {
      const error = new Error("Class code is required");
      error.statusCode = 400;
      throw error;
    }

    const cleanCode = rawCode.trim().toUpperCase();
    const group = await teacherGroupsRepository.findByCode(cleanCode);

    if (!group) {
      const error = new Error(`No class found matching code "${cleanCode}". Please check with your teacher.`);
      error.statusCode = 404;
      throw error;
    }

    // Check if student already in group
    const alreadyEnrolled = group.students.some(
      (s) => s._id.toString() === studentUser._id.toString()
    );

    if (alreadyEnrolled) {
      return group;
    }

    // Add student to group
    const updatedGroup = await teacherGroupsRepository.addStudent(group._id, studentUser._id);

    // Update student enrolled_groups
    await Student.findByIdAndUpdate(studentUser._id, {
      $addToSet: { enrolled_groups: group._id },
    });

    // Post announcement message into group chat
    const studentName = `${studentUser.first_name || ""} ${studentUser.last_name || ""}`.trim() || "A new student";
    await teacherGroupsRepository.addMessage(group._id, {
      sender_id: studentUser._id,
      sender_name: studentName,
      sender_role: "student",
      message: `${studentName} joined the group using class code ${cleanCode}! 👋`,
    });

    return updatedGroup;
  }

  async addStudentDirect(teacherUser, groupId, studentIdentifier) {
    const group = await teacherGroupsRepository.findById(groupId);
    if (!group) {
      const error = new Error("Class group not found");
      error.statusCode = 404;
      throw error;
    }

    if (group.teacher_id._id.toString() !== teacherUser._id.toString()) {
      const error = new Error("Only the group teacher can add students directly");
      error.statusCode = 403;
      throw error;
    }

    const cleanId = studentIdentifier.trim();
    const student = await Student.findOne({
      $or: [
        { student_code: cleanId.toUpperCase() },
        { email: cleanId.toLowerCase() },
      ],
    });

    if (!student) {
      const error = new Error(`Student with identifier "${cleanId}" not found`);
      error.statusCode = 404;
      throw error;
    }

    const updated = await teacherGroupsRepository.addStudent(groupId, student._id);
    await Student.findByIdAndUpdate(student._id, {
      $addToSet: { enrolled_groups: groupId },
    });

    return updated;
  }

  async removeStudent(teacherUser, groupId, studentId) {
    const group = await teacherGroupsRepository.findById(groupId);
    if (!group) {
      const error = new Error("Class group not found");
      error.statusCode = 404;
      throw error;
    }

    if (group.teacher_id._id.toString() !== teacherUser._id.toString()) {
      const error = new Error("Only the group teacher can remove students");
      error.statusCode = 403;
      throw error;
    }

    await Student.findByIdAndUpdate(studentId, {
      $pull: { enrolled_groups: groupId },
    });

    return await teacherGroupsRepository.removeStudent(groupId, studentId);
  }

  async addLessonToGroup(teacherUser, groupId, lessonData) {
    const group = await teacherGroupsRepository.findById(groupId);
    if (!group) {
      const error = new Error("Class group not found");
      error.statusCode = 404;
      throw error;
    }

    if (group.teacher_id._id.toString() !== teacherUser._id.toString()) {
      const error = new Error("Only the group teacher can assign lessons");
      error.statusCode = 403;
      throw error;
    }

    const payload = {
      title: lessonData.title || lessonData.topic || "Teacher Lesson",
      topic: lessonData.topic || "Python Iteration",
      duration_minutes: lessonData.duration_minutes || 15,
      programming_language: lessonData.programming_language || "Python",
      lesson_id: lessonData.lesson_id || null,
    };

    return await teacherGroupsRepository.addLesson(groupId, payload);
  }

  async addTaskToGroup(teacherUser, groupId, taskData) {
    const group = await teacherGroupsRepository.findById(groupId);
    if (!group) {
      const error = new Error("Class group not found");
      error.statusCode = 404;
      throw error;
    }

    if (group.teacher_id._id.toString() !== teacherUser._id.toString()) {
      const error = new Error("Only the group teacher can assign tasks");
      error.statusCode = 403;
      throw error;
    }

    const payload = {
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : "",
      due_date: taskData.due_date ? new Date(taskData.due_date) : null,
      status: "assigned",
    };

    return await teacherGroupsRepository.addTask(groupId, payload);
  }

  async sendMessage(currentUser, groupId, messageText) {
    if (!messageText || !messageText.trim()) {
      const error = new Error("Message text cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    const group = await teacherGroupsRepository.findById(groupId);
    if (!group) {
      const error = new Error("Class group not found");
      error.statusCode = 404;
      throw error;
    }

    const isTeacher =
      group.teacher_id && group.teacher_id._id.toString() === currentUser._id.toString();
    const isStudent = group.students.some(
      (s) => s._id.toString() === currentUser._id.toString()
    );

    if (!isTeacher && !isStudent && currentUser.role !== "admin") {
      const error = new Error("You are not a member of this class group");
      error.statusCode = 403;
      throw error;
    }

    const senderName =
      currentUser.first_name || currentUser.last_name
        ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
        : currentUser.name || "Member";

    const messagePayload = {
      sender_id: currentUser._id,
      sender_name: senderName,
      sender_role: currentUser.role || (isTeacher ? "teacher" : "student"),
      sender_image: currentUser.profile_image || null,
      message: messageText.trim(),
      created_at: new Date(),
    };

    const updated = await teacherGroupsRepository.addMessage(groupId, messagePayload);
    // Return latest message
    const msgs = updated.messages;
    return msgs[msgs.length - 1];
  }

  async getGroupMessages(currentUser, groupId) {
    const group = await this.getGroupDetails(currentUser, groupId);
    return group.messages || [];
  }
}

export default new TeacherGroupsService();
