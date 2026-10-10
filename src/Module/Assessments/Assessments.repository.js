const Assessment = require('../../DB/Models/Assessment.model');

class AssessmentsRepository {
  async create(data) {
    return await Assessment.create(data);
  }

  async findAll(filter = {}) {
    return await Assessment.find(filter)
      .populate('course_id', 'title subject')
      .populate('module_id', 'title');
  }

  async findById(id) {
    return await Assessment.findById(id)
      .populate('course_id', 'title subject')
      .populate('module_id', 'title');
  }

  async update(id, data) {
    return await Assessment.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Assessment.findByIdAndDelete(id);
  }
}

module.exports = new AssessmentsRepository();
