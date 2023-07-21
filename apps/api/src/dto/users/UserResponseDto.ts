import { Expose } from 'class-transformer';
import Role from '../../models/role';
import { DocumentType } from '@typegoose/typegoose';
import { UserSchema } from '../../models/user';

export class UserResponseDto {
  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  role: Role;

  constructor(user: DocumentType<UserSchema>) {
    Object.assign(this, user.toJSON());
  }
}
