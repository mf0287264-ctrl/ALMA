const LessonGeneration = require('../../DB/Models/LessonGeneration.model');

class LessonGenerationsRepository {
  async create(data) {
    return await LessonGeneration.create(data);
  }

  async findAll(filter = {}) {
    return await LessonGeneration.find(filter)
      .populate('course_id', 'title subject')
      .populate('module_id', 'title')
      .populate('lesson_id', 'title status');
  }

  async findById(id) {
    return await LessonGeneration.findById(id)
      .populate('course_id', 'title subject')
      .populate('module_id', 'title')
      .populate('lesson_id', 'title status');
  }

  async update(id, data) {
    return await LessonGeneration.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await LessonGeneration.findByIdAndDelete(id);
  }
}

module.exports = new LessonGenerationsRepository();
