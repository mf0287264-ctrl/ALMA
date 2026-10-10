import Student from '../../DB/Models/Student.model.js';

class StudentsRepository {
  async create(data) {
    return await Student.create(data);
  }

  async findAll(filter = {}) {
    return await Student.find(filter).select('-password_hash');
  }

  async findById(id) {
    return await Student.findById(id).select('-password_hash');
  }

  async update(id, data) {
    return await Student.findByIdAndUpdate(id, data, { new: true }).select('-password_hash');
  }

  async delete(id) {
    return await Student.findByIdAndDelete(id);
  }
}

export default new StudentsRepository();
