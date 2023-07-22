# Authentication

**Authentication**

Authentication คือกระบวนการสร้างการตรวจสอบและยืนยันตัวตน ก่อนอื่นให้ทำการติดตั้งแพคเกจที่จำเป็นสำหรับการใช้งาน ดังนี้

```ps1
npm i jsonwebtoken passport passport-jwt passport-local compose-middleware
```

เราเริ่มต้นด้วยการสร้าง Entity สำหรับ User ก่อน

```ts
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Leave } from './Leave';

export enum Role {
  Admin,
  Manager,
  Member,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'int',
    default: Role.Member,
  })
  role!: Role;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true, unique: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  async hashPassword() {
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
  }

  isValidPassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
}
```

ทำการสร้างและลงทะเบียน Strategy ของ passport ใน `helper/auth.ts`

```ts
import { Request } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';

import { AppDataSource } from '@/api/data/data-source';
import { User } from '@/api/entity/User';
import { SignUpFormDto } from '../dto/auth/SignUpFormDto';
import config from '../config';

export const setup = () => {
  const userRepository = AppDataSource.getRepository(User);

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
          const user = userRepository.create({
            email,
            password,
            name: req.body.name,
          });
          await userRepository.save(user);
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
          const user = await userRepository.findOneBy({ email });

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
          const user = await userRepository.findOneBy({ refreshToken });

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

จากนั้นจึงสร้าง authenticator middleware ดังนี้

```ts
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

สร้าง auth controller ดังนี้

```ts
import { RequestHandler } from 'express';
import multer from 'multer';
import * as path from 'path';
import bodyValidator from '@/api/middleware/body-validator';
import * as authenticator from '@/api/middleware/authenticator';
import { LoginResponseDto } from '../dto/auth/LoginResponseDto';
import { UserResponseDto } from '../dto/users/UserResponseDto';
import { HTTP_STATUSES } from '../helper/http-statuses';
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
    res.status(HTTP_STATUSES.CREATED).json(new UserResponseDto(req.user));
  },
];

export const login: RequestHandler[] = [
  authenticator.signIn,
  async (req, res, next) => {
    const user = req.user;

    req.login(user, { session: false }, async (error) => {
      if (error) return next(error);

      const { accessToken, refreshToken } = authService.signAndSaveTokens(user);
      return res.status(HTTP_STATUSES.CREATED).json(new LoginResponseDto(accessToken, refreshToken, user));
    });
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

    const { accessToken, refreshToken } = authService.signAndSaveTokens(user);
    return res.status(HTTP_STATUSES.CREATED).json(new LoginResponseDto(accessToken, refreshToken, user));
  },
];

export const signOut: RequestHandler[] = [
  authenticator.accessToken,
  async (req, res) => {
    await authService.signOut(+req.userFromToken.id);
    res.status(HTTP_STATUSES.NO_CONTENT).send();
  },
];
```

พร้อมกับทำการสร้าง auth service

```ts
import jwt from 'jsonwebtoken';
import config from '../config';
import { AppDataSource } from '../data/data-source';
import { User } from '../entity/User';

const userRepository = AppDataSource.getRepository(User);

export const signAndSaveTokens = (user: User) => {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, config.secretKey.accessToken, { expiresIn: config.expiresIn.accessToken });
  const refreshToken = jwt.sign({ sub: user.id }, config.secretKey.accessToken, { expiresIn: config.expiresIn.refreshToken });

  user.refreshToken = refreshToken;
  userRepository.save(user);

  return { accessToken, refreshToken };
};

export const signOut = async (userId: number) => {
  await userRepository.update({ id: userId }, { refreshToken: null });
};
```

แล้วจึงทำการ register route

```ts
router.get('/admin/leaves', adminLeavesController.findAll);
router.get('/admin/leaves/:id', adminLeavesController.findOne);
router.patch('/admin/leaves/:id/approve', adminLeavesController.approve);
router.patch('/admin/leaves/:id/reject', adminLeavesController.reject);
```

สุดท้ายทำการ register stratergy ใน `main.ts`

```ts
import { setup as setupAuth } from './helper/auth';

setupAuth();
```

[&lt; Back To สไลด์เรื่อง Authentication / Authorization](Slide-Authentication_Authorization.md) | [Next To Authorization &gt; ](Authorization.md)
