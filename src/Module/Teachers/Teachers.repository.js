import Teacher from '../../DB/Models/Teacher.model.js';

class TeachersRepository {
  async create(data) {
    return await Teacher.create(data);
  }

  async findAll(filter = {}) {
    return await Teacher.find(filter).select('-password_hash');
  }

  async findById(id) {
    return await Teacher.findById(id).select('-password_hash');
  }

  async update(id, data) {
    return await Teacher.findByIdAndUpdate(id, data, { new: true }).select('-password_hash');
  }

  async delete(id) {
    return await Teacher.findByIdAndDelete(id);
  }
}

export default new TeachersRepository();
