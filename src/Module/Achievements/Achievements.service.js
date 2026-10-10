import achievementsRepository from './Achievements.repository.js';

class AchievementsService {
  async createAchievement(data) {
    return await achievementsRepository.create(data);
  }

  async getAllAchievements(filter) {
    return await achievementsRepository.findAll(filter);
  }

  async getAchievementById(id) {
    const achievement = await achievementsRepository.findById(id);
    if (!achievement) {
      const error = new Error('Achievement not found');
      error.statusCode = 404;
      throw error;
    }
    return achievement;
  }

  async updateAchievement(id, data) {
    const achievement = await achievementsRepository.update(id, data);
    if (!achievement) {
      const error = new Error('Achievement not found');
      error.statusCode = 404;
      throw error;
    }
    return achievement;
  }

  async deleteAchievement(id) {
    const achievement = await achievementsRepository.delete(id);
    if (!achievement) {
      const error = new Error('Achievement not found');
      error.statusCode = 404;
      throw error;
    }
    return achievement;
  }
}

export default new AchievementsService();
