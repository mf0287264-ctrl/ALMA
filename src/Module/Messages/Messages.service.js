import messagesRepository from './Messages.repository.js';
import studentsRepository from '../Students/Students.repository.js';

class MessagesService {
  async getThreads(studentId) {
    return await messagesRepository.getThreads(studentId);
  }

  async getConversation(currentUserId, partnerIdentifier) {
    const partner = await messagesRepository.findStudentByIdentifier(partnerIdentifier);
    if (!partner) {
      const error = new Error('Teacher or student not found');
      error.statusCode = 404;
      throw error;
    }

    const messages = await messagesRepository.getConversation(currentUserId, partner._id);
    await messagesRepository.markAsRead(currentUserId, partner._id);

    return {
      partner: {
        _id: partner._id,
        first_name: partner.first_name,
        last_name: partner.last_name,
        student_code: partner.student_code,
        grade_level: partner.grade_level,
        profile_image: partner.profile_image || partner.profileImage || null
      },
      messages: messages.map((m) => ({
        _id: m._id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        message: m.message,
        read: m.read,
        created_at: m.created_at,
        is_mine: m.sender_id.toString() === currentUserId.toString()
      }))
    };
  }

  async sendMessage(currentUserId, partnerIdentifier, messageText) {
    if (typeof messageText !== 'string' || !messageText.trim() || messageText.length > 5000) {
      const error = new Error('Message cannot be empty');
      error.statusCode = 400;
      throw error;
    }

    const partner = await messagesRepository.findStudentByIdentifier(partnerIdentifier);
    if (!partner) {
      const error = new Error('Recipient not found');
      error.statusCode = 404;
      throw error;
    }

    if (partner._id.toString() === currentUserId.toString()) {
      const error = new Error('You cannot message yourself');
      error.statusCode = 400;
      throw error;
    }

    const created = await messagesRepository.create({
      sender_id: currentUserId,
      receiver_id: partner._id,
      message: messageText.trim()
    });

    return {
      _id: created._id,
      sender_id: created.sender_id,
      receiver_id: created.receiver_id,
      message: created.message,
      read: created.read,
      created_at: created.created_at,
      is_mine: true
    };
  }
}

export default new MessagesService();
