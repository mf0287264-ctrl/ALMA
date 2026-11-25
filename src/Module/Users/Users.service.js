import { getUserRepoByRole, userRepo } from './Users.repository.js';

export const uploadProfilePicture = async (file, user) => {
  const normalizedPath = file.path.replace(/\\/g, '/');
  const targetRepo = user?.role ? getUserRepoByRole(user.role) : userRepo;

  return await targetRepo.updateDocumentById(
    user._id || user.id,
    {
      profileImage: normalizedPath,
      profile_image: normalizedPath
    },
    { new: true }
  );
};

export const updateUserName = async ({ first_name, last_name }, user) => {
  const targetRepo = user?.role ? getUserRepoByRole(user.role) : userRepo;

  return await targetRepo.updateDocumentById(
    user._id || user.id,
    {
      first_name,
      last_name
    },
    { new: true }
  );
};

export default {
  uploadProfilePicture,
  updateUserName
};
