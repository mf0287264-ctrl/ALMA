import argon2 from 'argon2';

/**
 * Hashes a plain text password using Argon2id
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  });
};

/**
 * Verifies a plain text password against an Argon2 hash
 * @param {string} hash 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};
