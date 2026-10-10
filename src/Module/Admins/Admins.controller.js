const adminsService = require('./Admins.service');

class AdminsController {
  async create(req, res, next) {
    try {
      const admin = await adminsService.createAdmin(req.body);
      res.status(201).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const admins = await adminsService.getAllAdmins(req.query);
      res.status(200).json({ success: true, data: admins });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const admin = await adminsService.getAdminById(req.params.id);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const admin = await adminsService.updateAdmin(req.params.id, req.body);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await adminsService.deleteAdmin(req.params.id);
      res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminsController();
