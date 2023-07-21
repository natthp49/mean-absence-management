import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../users/UserResponseDto';
import { DocumentType } from '@typegoose/typegoose';
import { UserSchema } from '../../models/user';

export class LoginResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: DocumentType<UserSchema>;

  constructor(
    accessToken: string,
    refreshToken: string,
    user: DocumentType<UserSchema>
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
