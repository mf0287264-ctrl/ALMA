const modulesRepository = require('./Modules.repository');

class ModulesService {
  async createModule(data) {
    return await modulesRepository.create(data);
  }

  async getAllModules(filter) {
    return await modulesRepository.findAll(filter);
  }

  async getModuleById(id) {
    const moduleItem = await modulesRepository.findById(id);
    if (!moduleItem) {
      const error = new Error('Module not found');
      error.statusCode = 404;
      throw error;
    }
    return moduleItem;
  }

  async updateModule(id, data) {
    const moduleItem = await modulesRepository.update(id, data);
    if (!moduleItem) {
      const error = new Error('Module not found');
      error.statusCode = 404;
      throw error;
    }
    return moduleItem;
  }

  async deleteModule(id) {
    const moduleItem = await modulesRepository.delete(id);
    if (!moduleItem) {
      const error = new Error('Module not found');
      error.statusCode = 404;
      throw error;
    }
    return moduleItem;
  }
}

module.exports = new ModulesService();
