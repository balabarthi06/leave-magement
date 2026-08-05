import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  if (!hashedPassword) return false;
  if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
    return bcrypt.compare(password, hashedPassword);
  }
  return password === hashedPassword;
};
