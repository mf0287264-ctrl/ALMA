import studentsRepository from '../Students/Students.repository.js';
import teachersRepository from '../Teachers/Teachers.repository.js';
import parentsRepository from '../Parents/Parents.repository.js';
import adminsRepository from '../Admins/Admins.repository.js';

export const getUserRepoByRole = (role) => {
  switch (role) {
    case 'teacher':
      return teachersRepository;
    case 'parent':
      return parentsRepository;
    case 'admin':
      return adminsRepository;
    case 'student':
    default:
      return studentsRepository;
  }
};

export const userRepo = {
  updateDocumentById: async (userId, data, options = { new: true }) => {
    // Try each repository if role is not directly bound
    let updated = await studentsRepository.updateDocumentById(userId, data, options);
    if (updated) return updated;

    updated = await teachersRepository.updateDocumentById(userId, data, options);
    if (updated) return updated;

    updated = await parentsRepository.updateDocumentById(userId, data, options);
    if (updated) return updated;

    updated = await adminsRepository.updateDocumentById(userId, data, options);
    return updated;
  }
};

export default {
  getUserRepoByRole,
  userRepo
};
