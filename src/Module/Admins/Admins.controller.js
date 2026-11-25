import adminsService from './Admins.service.js';

class AdminsController {
  async verifyTeacher(req, res, next) {
    try { res.status(200).json({ success: true, data: await adminsService.verifyTeacher(req.authUser._id, req.body?.teacher_id) }); }
    catch (error) { next(error); }
  }
  async linkGuardian(req, res, next) {
    try { res.status(200).json({ success: true, data: await adminsService.linkGuardian(req.authUser._id, req.body || {}) }); }
    catch (error) { next(error); }
  }
  async create(req, res, next) {
    try {
      const result = await adminsService.createAdmin(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await adminsService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      res.status(200).json({ success: true, data: req.authUser });
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
      const adminId = req.authUser?.role === 'admin' && req.params.id ? req.params.id : req.authUser?._id;
      const admin = await adminsService.updateAdmin(adminId, req.body);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const adminId = req.authUser?.role === 'admin' && req.params.id ? req.params.id : req.authUser?._id;
      await adminsService.deleteAdmin(adminId);
      res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminsController();
