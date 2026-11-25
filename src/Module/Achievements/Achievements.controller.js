import achievementsService from './Achievements.service.js';

class AchievementsController {
  async getMyAchievements(req, res, next) {
    try {
      const user = req.authUser;
      const data = await achievementsService.getMyAchievements(user);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async triggerCourseCompletion(req, res, next) {
    try {
      const studentId = req.authUser._id;
      const courseId = req.params.courseId;
      const result = await achievementsService.checkAndAwardCourseCompletion(
        studentId,
        courseId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async completeLesson(req, res, next) {
    try {
      const studentId = req.authUser._id;
      const lessonId = req.params.lessonId || req.params.id;
      const result = await achievementsService.completeLesson(studentId, lessonId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const achievement = await achievementsService.createAchievement(req.body);
      res.status(201).json({ success: true, data: achievement });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      if (req.authUser) {
        const data = await achievementsService.getMyAchievements(req.authUser);
        return res.status(200).json({ success: true, data });
      }
      const achievements = await achievementsService.getAllAchievements(req.query);
      res.status(200).json({ success: true, data: achievements });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const achievement = await achievementsService.getAchievementById(req.params.id);
      res.status(200).json({ success: true, data: achievement });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const achievement = await achievementsService.updateAchievement(req.params.id, req.body);
      res.status(200).json({ success: true, data: achievement });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await achievementsService.deleteAchievement(req.params.id);
      res.status(200).json({ success: true, message: 'Achievement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AchievementsController();
