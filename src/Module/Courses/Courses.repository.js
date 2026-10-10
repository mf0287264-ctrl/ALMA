import Course from '../../DB/Models/Course.model.js';

class CoursesRepository {
  async create(data) {
    return await Course.create(data);
  }

  async findAll(filter = {}) {
    return await Course.find(filter);
  }

  async findById(id) {
    return await Course.findById(id);
  }

  async update(id, data) {
    return await Course.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Course.findByIdAndDelete(id);
  }
}

export default new CoursesRepository();
