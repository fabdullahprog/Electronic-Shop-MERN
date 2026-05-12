import jwt from 'jsonwebtoken';

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  } as jwt.SignOptions);
};

export default generateToken;


