import ModuleModel from '../../DB/Models/Module.model.js';

class ModulesRepository {
  async create(data) {
    return await ModuleModel.create(data);
  }

  async findAll(filter = {}) {
    return await ModuleModel.find(filter).populate('course_id', 'title subject grade_level');
  }

  async findById(id) {
    return await ModuleModel.findById(id).populate('course_id', 'title subject grade_level');
  }

  async update(id, data) {
    return await ModuleModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await ModuleModel.findByIdAndDelete(id);
  }
}

export default new ModulesRepository();
