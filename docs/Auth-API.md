# Auth API

### Authentication และ Authorization

Authentication คือกระบวนการที่ทำให้ระบบทราบว่าผู้ใช้งานขณะนั้นคือใคร ดังนั้นกระบวนการของ Authentication จึงหมายถึงขั้นตอนของการลงทะเบียน การเข้าสู่ระบบ และการออกจากระบบนั่นเอง

เราจะเริ่มต้นด้วยการสร้างโมเดลของ User ขึ้นมาก่อนบนไฟล์ `models/user.ts`

```typescript
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

  static hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  isValidPassword(this: DocumentType<UserSchema>, password: string) {
    return bcrypt.compare(password, this.password);
  }
}
```

พร้อมกันนี้ให้ทำการสร้างไฟล์แทน role คือ `models/role.ts`

```typescript
enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  MEMBER = 'Member',
}

export default Role;
```

ในขั้นตอนดังกล่าวเราต้องการแพคเกจคือ bcrypt ผ่านการติดตั้งด้วยคำสั่ง `npm i bcrypt`

ต่อไปให้ทำการอัพเดท `models/index.ts` เพื่อประกาศคลาสสำหรับ User

```typescript
import { getModelForClass } from '@typegoose/typegoose';
import { UserSchema } from './user';
import { LeaveSchema } from './leave';

export const User = getModelForClass(UserSchema);
export const Leave = getModelForClass(LeaveSchema);

export { default as Role } from './role';
export { default as LeaveStatus } from './leave-status';
```

จากนั้นทำการประกาศ routes สำหรับการทำ authentication ในไฟล์ `v1.ts` ดังนี้

```typescript
import express from 'express';
import * as leavesController from '../controllers/leaves';
import * as authController from '../controllers/auth';

export const setup = (router: express.Router) => {
  router.get('/leaves', leavesController.findAll);
  router.get('/leaves/:id', leavesController.findOne);
  router.post('/leaves', leavesController.create);
  router.patch('/leaves/:id', leavesController.update);
  router.post('/auth/sign-up', authController.register);
  router.post('/auth/sign-in', authController.login);
  router.get('/auth/profile', authController.getProfile);
  router.patch('/auth/profile', authController.updateProfile);
  router.post('/auth/refresh-token', authController.refreshToken);
  router.delete('/auth/sign-out', authController.signOut);
};
```

พร้อมกันนี้ให้ทำการสร้าง `controllers/auth.ts`

```typescript
import { RequestHandler } from 'express';
import multer from 'multer';
import * as path from 'path';
import bodyValidator from '../middleware/body-validator';
import * as authenticator from '../middleware/authenticator';
import { LoginResponseDto } from '../dto/auth/LoginResponseDto';
import { UserResponseDto } from '../dto/users/UserResponseDto';
import * as authService from '../service/auth';
import * as userService from '../service/users';
import { UpdateProfileFormDto } from '../dto/auth/UpdateProfileFormDto';
import { SignUpFormDto } from '../dto/auth/SignUpFormDto';
import { RefreshTokenFormDto } from '../dto/auth/RefreshTokenFormDto';

const upload = multer({ dest: path.join(__dirname, 'uploads', 'users') });

export const register: RequestHandler[] = [
  bodyValidator(SignUpFormDto),
  authenticator.signUp,
  async (req, res) => {
    res.status(201).json(new UserResponseDto(req.user));
  },
];

export const login: RequestHandler[] = [
  authenticator.signIn,
  async (req, res, next) => {
    try {
      const user = req.user;
      const { accessToken, refreshToken } = await authService.signAndSaveTokens(user);

      res.status(201).json(new LoginResponseDto(accessToken, refreshToken, user));
    } catch (e) {
      next(e);
    }
  },
];

export const getProfile: RequestHandler[] = [
  authenticator.accessToken,
  async (req, res) => {
    const user = await userService.getUserById(req.userFromToken.id);
    res.json(new UserResponseDto(user));
  },
];

export const updateProfile: RequestHandler[] = [
  upload.single('avatar'),
  authenticator.accessToken,
  bodyValidator(UpdateProfileFormDto),
  async (req, res) => {
    const payload: UpdateProfileFormDto & { avatar: string } = req.body;
    if (req.file) payload.avatar = `uploads/users/${req.file.filename}`;
    const user = await userService.updateUser(req.userFromToken.id, payload);
    res.json(new UserResponseDto(user));
  },
];

export const refreshToken: RequestHandler[] = [
  bodyValidator(RefreshTokenFormDto),
  authenticator.refreshToken,
  async (req, res) => {
    const user = req.user;

    const { accessToken, refreshToken } = await authService.signAndSaveTokens(user);

    res.status(201).json(new LoginResponseDto(accessToken, refreshToken, user));
  },
];

export const signOut: RequestHandler[] = [
  authenticator.accessToken,
  async (req, res) => {
    await authService.signOut(req.userFromToken.id);
    res.status(204).send();
  },
];
```

ในการทำ authentication เรามีแพคเกจยอดนิยมชื่อ passport ที่สามารถใช้เพื่อการนี้ได้ เราจะทำการติดตั้ง passport พร้อมแพคเกจอื่น ๆ ที่เกี่ยวข้องตามคำสั่งดังนี้

```powershell
$ npm i passport passport-local passport-jwt compose-middleware
$ npm i -D @types/passport @types/passport-local @types/passport-jwt
```

สร้างไฟล์ `helpers/auth.ts` ดังนี้

```typescript
import { Request } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';

import { SignUpFormDto } from '../dto/auth/SignUpFormDto';
import { config } from '../config/manager';
import { User } from '../models';

export const setup = () => {
  passport.use(
    'sign-up',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req: Request<unknown, unknown, SignUpFormDto>, email, password, done) => {
        try {
          const user = await User.create({
            email,
            password: await User.hashPassword(password),
            name: req.body.name,
          });

          return done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    'sign-in',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          const validate = await user.isValidPassword(password);

          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }

          return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    'access-token',
    new JwtStrategy(
      {
        secretOrKey: config.secretKey.accessToken,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        try {
          return done(null, {
            id: token.sub,
            role: token.role,
          } as Express.User);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    'refresh-token',
    new JwtStrategy(
      {
        secretOrKey: config.secretKey.refreshToken,
        jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
        passReqToCallback: true,
      },
      async (req: Request, _token: null, done: VerifiedCallback) => {
        try {
          const refreshToken = req.body.refreshToken;
          const user = await User.findOne({ refreshToken });

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
```

ส่วนของ Profile จะมีส่วนของการอัพโหลด avatar ได้ เราจึงใช้แพคเกจชื่อ multer ผ่านการติดตั้งคือ

```powershell
$ npm i multer
$ npm i -D @types/multer
```

ส่วนถัดไปให้ทำการสร้าง DTO ขึ้นมาภายใต้โฟลเดอร์คือ `dto/auth` ดังนี้

```typescript
// LoginResponseDto.ts
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

  constructor(accessToken: string, refreshToken: string, user: DocumentType<UserSchema>) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}

// RefreshTokenFormDto.ts
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class RefreshTokenFormDto {
  @Expose()
  @IsString()
  refreshToken: string;
}

// SignUpFormDto.ts
import { Expose } from 'class-transformer';
import { IsEmail, Length } from 'class-validator';

export class SignUpFormDto {
  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @Length(8)
  password: string;

  @Expose()
  name: string;
}

// UpdateProfileFormDto.ts
import { PartialType } from '@nestjs/mapped-types';
import { SignUpFormDto } from './SignUpFormDto';

export class UpdateProfileFormDto extends PartialType(SignUpFormDto) {}
```

และทำการสร้าง `dto/users/UserResponseDto.ts`

```typescript
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
```

สร้างไฟล์ `config/manager.ts` สำหรับการจัดการค่า config

```typescript
export const config = {
  databaseUrl: process.env.DATABASE_URL,
  secretKey: {
    accessToken: process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshToken: process.env.REFRESH_TOKEN_SECRET_KEY,
  },
  expiresIn: {
    accessToken: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshToken: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
};
```

พร้อมกันนี้ให้ทำการอัพเดทค่าของ `types/env.d.ts`

```typescript
declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET_KEY: string;
    REFRESH_TOKEN_SECRET_KEY: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
  }
}
```

จากนั้นจึงทำการตั้งค่า `.env` ใหม่ที่รวมส่วนของ Token

```dotenv
DATABASE_URL=mongodb://127.0.0.1:27017/mean-absence-management
ACCESS_TOKEN_SECRET_KEY=secret
REFRESH_TOKEN_SECRET_KEY=secret
ACCESS_TOKEN_EXPIRES_IN=150s
REFRESH_TOKEN_EXPIRES_IN=300s
```

ต่อมาให้ทำการสร้าง middleware สำหรับจัดการเรื่อง authentication โดยเฉพาะในไฟล์ `middleware/authenticator.ts`

```typescript
import { RequestHandler } from 'express';
import passport from 'passport';
import { compose } from 'compose-middleware';

export const signUp = passport.authenticate('sign-up', { session: false });

export const signIn = passport.authenticate('sign-in', { session: false });

export const accessToken: RequestHandler = compose([
  passport.initialize({ userProperty: 'userFromToken' }),
  passport.authenticate('access-token', {
    session: false,
  }),
]);

export const refreshToken = passport.authenticate('refresh-token', {
  session: false,
});
```

ทำการสร้าง `services/auth.ts`

```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config/manager';
import { UserSchema } from '../models/user';
import { User } from '../models';
import { DocumentType } from '@typegoose/typegoose';

export const signAndSaveTokens = async (user: DocumentType<UserSchema>) => {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, config.secretKey.accessToken, { expiresIn: config.expiresIn.accessToken });
  const refreshToken = jwt.sign({ sub: user.id }, config.secretKey.accessToken, { expiresIn: config.expiresIn.refreshToken });

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const signOut = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
```

และทำการสร้าง `services/users.ts`

```typescript
import fs from 'fs/promises';
import * as path from 'path';
import { UserSchema } from '../models/user';
import { User } from '../models';
import { FilterOutFunctionKeys } from '@typegoose/typegoose/lib/types';

export const getUserById = (id: string) => {
  return User.findById(id);
};

export const updateUser = async (id: string, form: Partial<Pick<FilterOutFunctionKeys<UserSchema>, 'avatar' | 'email' | 'name' | 'password'>>) => {
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
```

ทำการประกาศให้ TypeScript ทราบว่า `req.user` ของ Express.js มีชนิดข้อมูลอย่างไรในไฟล์ `types/express.d.ts`

```typescript
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
```

สุดท้ายทำการอัพเดท `main.ts` ดังนี้

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { setup as setupRoutes } from './routes';
import { setup as setupAuth } from './helpers/auth';
import errorHandler from './middleware/error-handler';
import responseTransformer from './middleware/response-transformer';
import { connect } from './config/db';

async function setup() {
  dotenv.config();
  await connect();

  const app = express();
  app.use(bodyParser.json());

  app.use(
    cors({
      origin: '*',
    })
  );
  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  app.use(responseTransformer);
  setupAuth();
  setupRoutes(app);
  app.use(errorHandler);

  const port = process.env.PORT || 3333;
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
  });
  server.on('error', console.error);
}

setup();
```

[&lt; Back To HTTP Interceptors](HTTP-Interceptors.md) | [Next To Deployment &gt; ](Deployment.md)
