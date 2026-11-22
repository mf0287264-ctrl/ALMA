import teacherGroupsService from "./TeacherGroups.service.js";

class TeacherGroupsController {
  async createGroup(req, res, next) {
    try {
      const group = await teacherGroupsService.createGroup(req.authUser, req.body);
      return res.status(201).json({
        success: true,
        message: "Class group created successfully",
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyGroups(req, res, next) {
    try {
      const groups = await teacherGroupsService.getMyGroups(req.authUser);
      return res.status(200).json({
        success: true,
        data: groups,
      });
    } catch (err) {
      next(err);
    }
  }

  async getGroupById(req, res, next) {
    try {
      const group = await teacherGroupsService.getGroupDetails(req.authUser, req.params.id);
      return res.status(200).json({
        success: true,
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async joinWithCode(req, res, next) {
    try {
      const group = await teacherGroupsService.joinGroupWithCode(
        req.authUser,
        req.body.class_code
      );
      return res.status(200).json({
        success: true,
        message: `Successfully joined ${group.name}!`,
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async addStudentDirect(req, res, next) {
    try {
      const group = await teacherGroupsService.addStudentDirect(
        req.authUser,
        req.params.id,
        req.body.student_identifier
      );
      return res.status(200).json({
        success: true,
        message: "Student added to class group",
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async removeStudent(req, res, next) {
    try {
      const group = await teacherGroupsService.removeStudent(
        req.authUser,
        req.params.id,
        req.params.studentId
      );
      return res.status(200).json({
        success: true,
        message: "Student removed from class group",
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async addLesson(req, res, next) {
    try {
      const group = await teacherGroupsService.addLessonToGroup(
        req.authUser,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Lesson added to class group",
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async addTask(req, res, next) {
    try {
      const group = await teacherGroupsService.addTaskToGroup(
        req.authUser,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Task assigned to class group",
        data: group,
      });
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const msg = await teacherGroupsService.sendMessage(
        req.authUser,
        req.params.id,
        req.body.message
      );
      return res.status(201).json({
        success: true,
        data: msg,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await teacherGroupsService.getGroupMessages(
        req.authUser,
        req.params.id
      );
      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new TeacherGroupsController();
