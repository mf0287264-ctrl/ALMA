import parentsService from './Parents.service.js';

class ParentsController {
  async create(req, res, next) {
    try {
      const result = await parentsService.createParent(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await parentsService.login(req.body);
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
      const parents = await parentsService.getAllParents(req.query);
      res.status(200).json({ success: true, data: parents });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const parent = await parentsService.getParentById(req.params.id);
      res.status(200).json({ success: true, data: parent });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const parentId = req.authUser?._id || req.params.id;
      const parent = await parentsService.updateParent(parentId, req.body);
      res.status(200).json({ success: true, data: parent });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const parentId = req.authUser?._id || req.params.id;
      await parentsService.deleteParent(parentId);
      res.status(200).json({ success: true, message: 'Parent deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async linkChild(req, res, next) {
    try {
      const parentId = req.authUser?._id;
      const result = await parentsService.linkChild(parentId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unlinkChild(req, res, next) {
    try {
      const parentId = req.authUser?._id;
      const childId = req.body.child_id || req.params.childId;
      const result = await parentsService.unlinkChild(parentId, childId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getChildren(req, res, next) {
    try {
      const parentId = req.authUser?._id;
      const children = await parentsService.getLinkedChildren(parentId);
      res.status(200).json({ success: true, data: children });
    } catch (error) {
      next(error);
    }
  }

  async getChildProgress(req, res, next) {
    try {
      const parentId = req.authUser?._id;
      const { childId } = req.params;
      const progress = await parentsService.getChildProgress(parentId, childId);
      res.status(200).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const parentId = req.authUser?._id;
      const message = await parentsService.sendMessage(parentId, req.body);
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const parentId = req.authUser?._id;
      const messages = await parentsService.getMessageHistory(parentId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }
}

export default new ParentsController();
