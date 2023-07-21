import fs from 'fs/promises';
import * as path from 'path';
import { UserSchema } from '../models/user';
import { User } from '../models';
import { FilterOutFunctionKeys } from '@typegoose/typegoose/lib/types';

export const getUserById = (id: string) => {
  return User.findById(id);
};

export const updateUser = async (
  id: string,
  form: Partial<
    Pick<
      FilterOutFunctionKeys<UserSchema>,
      'avatar' | 'email' | 'name' | 'password'
    >
  >
) => {
  const currentUser = await getUserById(id);
  const currentAvatar = currentUser.avatar;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      ...form,
      password: form.password ? await User.hashPassword(form.password) : null,
    },
    { new: true }
  );

  if (currentAvatar && form.avatar) {
    fs.rm(path.join(__dirname, currentAvatar), { force: true });
  }

  return updatedUser;
};
