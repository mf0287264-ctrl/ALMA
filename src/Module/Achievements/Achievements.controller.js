import achievementsService from './Achievements.service.js';

class AchievementsController {
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
