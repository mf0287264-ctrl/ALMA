const modulesService = require('./Modules.service');

class ModulesController {
  async create(req, res, next) {
    try {
      const moduleItem = await modulesService.createModule(req.body);
      res.status(201).json({ success: true, data: moduleItem });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const modules = await modulesService.getAllModules(req.query);
      res.status(200).json({ success: true, data: modules });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const moduleItem = await modulesService.getModuleById(req.params.id);
      res.status(200).json({ success: true, data: moduleItem });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const moduleItem = await modulesService.updateModule(req.params.id, req.body);
      res.status(200).json({ success: true, data: moduleItem });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await modulesService.deleteModule(req.params.id);
      res.status(200).json({ success: true, message: 'Module deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ModulesController();
