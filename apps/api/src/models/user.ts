import { DocumentType, Ref, prop, modelOptions } from '@typegoose/typegoose';
import * as bcrypt from 'bcrypt';
import validator from 'validator';
import Role from './role';
import { BaseSchema } from './base';
import { LeaveSchema } from './leave';

@modelOptions({ schemaOptions: { collection: 'users' } })
export class UserSchema extends BaseSchema {
  @prop({ required: true })
  name: string;

  @prop({
    required: true,
    unique: true,
    validate: [validator.isEmail, 'invalid email'],
  })
  email: string;

  @prop({
    required: true,
    validate: {
      validator: (v: string) => validator.isLength(v, { min: 8 }),
      message: 'password must be 8 chars at least',
    },
  })
  password: string;

  @prop({ enum: Role, type: () => String, default: Role.MEMBER })
  role: Role;

  @prop()
  avatar?: string;

  @prop({
    index: {
      unique: true,
      partialFilterExpression: { refreshToken: { $type: 'string' } },
    },
  })
  refreshToken?: string;

  @prop({ ref: () => LeaveSchema })
  leaves?: Ref<LeaveSchema>[];

  @prop({ ref: () => LeaveSchema })
  managedLeaves?: Ref<LeaveSchema>[];

  static hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  isValidPassword(this: DocumentType<UserSchema>, password: string) {
    return bcrypt.compare(password, this.password);
  }
}
