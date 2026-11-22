import messagesService from './Messages.service.js';

class MessagesController {
  async getThreads(req, res, next) {
    try {
      const studentId = req.authUser._id;
      const threads = await messagesService.getThreads(studentId);
      res.status(200).json({ success: true, data: threads });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const currentUserId = req.authUser._id;
      const partnerIdentifier = req.params.partnerId;
      const conversation = await messagesService.getConversation(currentUserId, partnerIdentifier);
      res.status(200).json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const currentUserId = req.authUser._id;
      const partnerIdentifier = req.params.partnerId;
      const { message } = req.body;
      const created = await messagesService.sendMessage(currentUserId, partnerIdentifier, message);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessagesController();
