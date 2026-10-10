const Course = require('../../DB/Models/Course.model');

class CoursesRepository {
  async create(data) {
    return await Course.create(data);
  }

  async findAll(filter = {}) {
    return await Course.find(filter).populate('created_by', 'first_name last_name email');
  }

  async findById(id) {
    return await Course.findById(id).populate('created_by', 'first_name last_name email');
  }

  async update(id, data) {
    return await Course.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Course.findByIdAndDelete(id);
  }
}

module.exports = new CoursesRepository();
