import { getModelForClass } from '@typegoose/typegoose';
import { UserSchema } from './user';
import { LeaveSchema } from './leave';

export const User = getModelForClass(UserSchema);
export const Leave = getModelForClass(LeaveSchema);

export { default as Role } from './role';
export { default as LeaveStatus } from './leave-status';
