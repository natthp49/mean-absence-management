import { Ref, modelOptions, prop } from '@typegoose/typegoose';
import { BaseSchema } from './base';
import LeaveStatus from './leave-status';
import { UserSchema } from './user';

@modelOptions({ schemaOptions: { collection: 'leaves' } })
export class LeaveSchema extends BaseSchema {
  @prop({
    enum: LeaveStatus,
    type: () => String,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @prop({ required: true })
  reason: string;

  @prop({ required: true })
  leaveDate: Date;

  @prop()
  rejectionReason?: string;

  @prop({ ref: () => UserSchema })
  user: Ref<UserSchema>;

  @prop({ ref: () => UserSchema })
  approvedBy?: Ref<UserSchema>;
}
