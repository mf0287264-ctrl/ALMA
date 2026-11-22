import TeacherGroup from "../../DB/Models/TeacherGroup.model.js";

class TeacherGroupsRepository {
  async create(data) {
    return await TeacherGroup.create(data);
  }

  async findById(id) {
    return await TeacherGroup.findById(id)
      .populate("teacher_id", "first_name last_name email teacher_code profile_image specialization")
      .populate("students", "first_name last_name email student_code profile_image grade_level current_streak lessons_completed");
  }

  async findByCode(classCode) {
    return await TeacherGroup.findOne({ class_code: classCode.trim().toUpperCase() })
      .populate("teacher_id", "first_name last_name email teacher_code profile_image specialization")
      .populate("students", "first_name last_name email student_code profile_image grade_level current_streak lessons_completed");
  }

  async findByTeacherId(teacherId) {
    return await TeacherGroup.find({ teacher_id: teacherId })
      .sort({ created_at: -1 })
      .populate("students", "first_name last_name email student_code profile_image grade_level current_streak lessons_completed");
  }

  async findByStudentId(studentId) {
    return await TeacherGroup.find({ students: studentId })
      .sort({ created_at: -1 })
      .populate("teacher_id", "first_name last_name email teacher_code profile_image specialization")
      .populate("students", "first_name last_name email student_code profile_image grade_level");
  }

  async addStudent(groupId, studentId) {
    return await TeacherGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { students: studentId } },
      { new: true }
    )
      .populate("teacher_id", "first_name last_name email teacher_code profile_image specialization")
      .populate("students", "first_name last_name email student_code profile_image grade_level current_streak lessons_completed");
  }

  async removeStudent(groupId, studentId) {
    return await TeacherGroup.findByIdAndUpdate(
      groupId,
      { $pull: { students: studentId } },
      { new: true }
    )
      .populate("students", "first_name last_name email student_code profile_image grade_level");
  }

  async addLesson(groupId, lessonData) {
    return await TeacherGroup.findByIdAndUpdate(
      groupId,
      { $push: { lessons: lessonData } },
      { new: true }
    );
  }

  async addTask(groupId, taskData) {
    return await TeacherGroup.findByIdAndUpdate(
      groupId,
      { $push: { tasks: taskData } },
      { new: true }
    );
  }

  async addMessage(groupId, messageData) {
    return await TeacherGroup.findByIdAndUpdate(
      groupId,
      { $push: { messages: messageData } },
      { new: true }
    );
  }

  async update(groupId, data) {
    return await TeacherGroup.findByIdAndUpdate(groupId, data, { new: true });
  }

  async delete(groupId) {
    return await TeacherGroup.findByIdAndDelete(groupId);
  }
}

export default new TeacherGroupsRepository();
