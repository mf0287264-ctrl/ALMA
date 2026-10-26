import crypto from 'crypto';
import studentLessonSessionsRepository from './StudentLessonSessions.repository.js';

class StudentLessonSessionsService {
  async createSession(data) {
    data.session_id = data.session_id || `sess_${crypto.randomBytes(6).toString('hex')}`;
    data.current_section_order = data.current_section_order || 1;
    data.checkpoint_logs = data.checkpoint_logs || [];
    data.dialogue_logs = data.dialogue_logs || [];
    data.status = data.status || 'active';
    data.personalized_greeting = data.personalized_greeting || null;
    return await studentLessonSessionsRepository.create(data);
  }

  async getAllSessions(filter) {
    return await studentLessonSessionsRepository.findAll(filter);
  }

  async getSessionById(id) {
    const session = await studentLessonSessionsRepository.findById(id);
    if (!session) {
      const error = new Error('Student lesson session not found');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }

  async updateSession(id, data) {
    const session = await studentLessonSessionsRepository.update(id, data);
    if (!session) {
      const error = new Error('Student lesson session not found');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }

  async logCheckpoint(id, checkpointData) {
    const session = await studentLessonSessionsRepository.addCheckpointLog(id, checkpointData);
    if (!session) {
      const error = new Error('Student lesson session not found');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }

  async logDialogue(id, dialogueData) {
    const session = await studentLessonSessionsRepository.addDialogueLog(id, dialogueData);
    if (!session) {
      const error = new Error('Student lesson session not found');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }

  async deleteSession(id) {
    const result = await studentLessonSessionsRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Student lesson session not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
}

export default new StudentLessonSessionsService();
