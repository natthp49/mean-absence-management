import jwt from 'jsonwebtoken';
import { config } from '../config/manager';
import { UserSchema } from '../models/user';
import { User } from '../models';
import { DocumentType } from '@typegoose/typegoose';

export const signAndSaveTokens = async (user: DocumentType<UserSchema>) => {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    config.secretKey.accessToken,
    { expiresIn: config.expiresIn.accessToken }
  );
  const refreshToken = jwt.sign(
    { sub: user.id },
    config.secretKey.accessToken,
    { expiresIn: config.expiresIn.refreshToken }
  );

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const signOut = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
