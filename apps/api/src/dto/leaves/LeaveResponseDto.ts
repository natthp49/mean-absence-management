import { Expose, Transform, Type } from 'class-transformer';
import { UserResponseDto } from '../users/UserResponseDto';
import { DocumentType } from '@typegoose/typegoose';
import LeaveStatus from '../../models/leave-status';
import { UserSchema } from '../../models/user';
import { LeaveSchema } from '../../models/leave';

export class LeaveResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  status: LeaveStatus;

  @Expose()
  reason: string;

  @Expose()
  leaveDate: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: DocumentType<UserSchema>;

  @Expose()
  @Type(() => UserResponseDto)
  approvedBy: DocumentType<UserSchema>;

  constructor(leave: DocumentType<LeaveSchema>) {
    Object.assign(this, leave.toJSON());
  }
}
