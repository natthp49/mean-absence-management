import { DocumentType } from '@typegoose/typegoose';
import Role from '../models/role';
import { UserSchema } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      userFromToken: {
        id?: string;
        role?: Role;
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends DocumentType<UserSchema> {}
  }
}
