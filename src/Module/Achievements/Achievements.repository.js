import Achievement from '../../DB/Models/Achievement.model.js';

class AchievementsRepository {
  async create(data) {
    return await Achievement.create(data);
  }

  async findAll(filter = {}) {
    return await Achievement.find(filter).populate('student_id', 'first_name last_name email student_code');
  }

  async findById(id) {
    return await Achievement.findById(id).populate('student_id', 'first_name last_name email student_code');
  }

  async update(id, data) {
    return await Achievement.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Achievement.findByIdAndDelete(id);
  }
}

export default new AchievementsRepository();
