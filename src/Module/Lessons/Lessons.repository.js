const Lesson = require('../../DB/Models/Lesson.model');

class LessonsRepository {
  async create(data) {
    return await Lesson.create(data);
  }

  async findAll(filter = {}) {
    return await Lesson.find(filter)
      .populate('course_id', 'title subject grade_level')
      .populate('module_id', 'title order');
  }

  async findById(id) {
    return await Lesson.findById(id)
      .populate('course_id', 'title subject grade_level')
      .populate('module_id', 'title order');
  }

  async update(id, data) {
    return await Lesson.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Lesson.findByIdAndDelete(id);
  }
}

module.exports = new LessonsRepository();
