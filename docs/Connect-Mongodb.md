# การเชื่อมต่อฐานข้อมูล MongoDB

### การเชื่อมต่อฐานข้อมูล MongoDB

MongoDB เป็นฐานข้อมูลตระกูล NoSQL แบบเชิงเอกสารที่มีการจัดเก็บเอกสาร (Document) ด้วยโครงสร้างเชิง JSON โดย MongoDB เป็นฐานข้อมูลที่เหมาะสมสำหรับแอพพลิเคชันที่เน้นไปที่การอ่านเป็นหลัก

เราจะทำการติดตั้ง MongoDB เพื่อใช้งานผ่าน Docker โดยให้ทำการสร้างไฟล์ `docker-compose.yml` ดังนี้

```yml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

ทำการเริ่มการทำงานของ MongoDB ด้วยคำสั่ง `docker compose up`

ลำดับต่อมาเราจะทำการติดตั้งแพคเกจต่าง ๆ ที่จะเป็นต่อการเชื่อมต่อและใช้งาน MongoDB ใน API ของเราโดยให้ทำการออกคำสั่ง ดังนี้

```powershell
$ npm i mongoose @typegoose/typegoose

```

ทำการอัพเดทชนิดข้อมูลของ env ในไฟล์ `api/types/env.d.ts`

```typescript
declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
  }
}
```

จากนั้นจึงทำการประกาศ env ในไฟล์ `api/.env`

```dotenv
DATABASE_URL=mongodb://127.0.0.1:27017/mean-absence-management

```

สร้างไฟล์ `config/db.ts` เพื่อสร้างการเชื่อมต่อกับ MongoDB

```typescript
import mongoose from 'mongoose';

export const connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
  } catch (e) {
    console.error(`cannot connect to the database: ${(e as Error).message}`);
    process.exit(1);
  }
};
```

ทำการโหลดไฟล์ `.env` โดยใช้แพคเกจชื่อ dotenv ผ่านคำสั่ง `npm i dotenv` แล้วจึงทำการเรียกใช้ใน `main.ts` พร้อมเชื่อมต่อ MongoDB

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { setup as setupRoutes } from './routes';
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

ต่อมาเราทำการสร้างส่วนประกอบพื้นฐานของ Model ใน MongoDB บนไฟล์ `models/base.ts`

```typescript
/* eslint-disable @typescript-eslint/no-empty-interface */
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export interface BaseSchema extends Base {}
export class BaseSchema extends TimeStamps {}
```

ลำดับถัดมาเราจะทำการสร้างโมเดลสำหรับ Leave ในไฟล์ `models/leave.ts`

```typescript
import { modelOptions, prop } from '@typegoose/typegoose';
import { BaseSchema } from './base';
import LeaveStatus from './leave-status';

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
}
```

พร้อมกันนี้ให้ทำการสร้างไฟล์สำหรับ status ในชื่อของ `models/leave-status.ts`

```typescript
enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export default LeaveStatus;
```

สุดท้ายเราจะสร้างไฟล์ `models/index.ts` โดยไฟล์นี้จะใช้เพื่อทำการสร้างคลาสสำหรับ model ดังนี้

```typescript
import { getModelForClass } from '@typegoose/typegoose';
import { LeaveSchema } from './leave';

export const Leave = getModelForClass(LeaveSchema);

export { default as LeaveStatus } from './leave-status';
```

เมื่อทุกอย่างเสร็จสิ้น เราก็สามารถใช้คลาส Leave ในการทำ CRUD บน MongoDB ได้เป็นที่เรียบร้อย

ให้ทำการอัพเดท `services/leaves.ts` เพื่อใช้ MongoDB ดังนี้

```typescript
import { FilterOutFunctionKeys } from '@typegoose/typegoose/lib/types';
import { Leave } from '../models';
import { LeaveSchema } from '../models/leave';

export const findOne = (id: string) => {
  return Leave.findById(id);
};

export const findAll = () => {
  return Leave.find();
};

export const create = (leave: Pick<FilterOutFunctionKeys<LeaveSchema>, 'leaveDate' | 'reason'>) => {
  return Leave.create(leave);
};

export const update = async (id: string, leave: Pick<FilterOutFunctionKeys<LeaveSchema>, 'leaveDate' | 'reason'>) => {
  await Leave.findByIdAndUpdate(id, leave);

  return await findOne(id);
};
```

ทั้งนี้ให้ทำการแก้ไข `LeaveResponseDto` ด้วย

```typescript
import { DocumentType } from '@typegoose/typegoose';
import { Expose, Transform } from 'class-transformer';
import { LeaveSchema } from '../../models/leave';

export class LeaveResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  @Transform(({ value }) => value.toLowerCase())
  status: string;

  @Expose()
  reason: string;

  @Expose()
  leaveDate: string;

  constructor(leave: DocumentType<LeaveSchema>) {
    Object.assign(this, leave.toJSON());
  }
}
```

จากนั้นจึงทำการแก้ไข `controllers/leaves.ts`

```typescript
import { RequestHandler } from 'express';
import * as service from '../services/leaves';
import bodyValidator from '../middleware/body-validator';
import { CreateLeaveFormDto } from '../dto/leaves/CreateLeaveFormDto';
import { EditLeaveFormDto } from '../dto/leaves/EditLeaveFormDto';
import { LeaveResponseDto } from '../dto/leaves/LeaveResponseDto';

export const findOne: RequestHandler = async (req, res) => {
  const leave = await service.findOne(req.params.id);

  res.json(new LeaveResponseDto(leave));
};

export const findAll: RequestHandler = async (req, res) => {
  const leaves = await service.findAll();

  res.json(leaves.map((l) => new LeaveResponseDto(l)));
};

export const create: RequestHandler[] = [
  bodyValidator(CreateLeaveFormDto),
  async (req, res) => {
    const leave = await service.create(req.body);

    res.status(201).json(new LeaveResponseDto(leave));
  },
];

export const update: RequestHandler[] = [
  bodyValidator(EditLeaveFormDto),
  async (req, res) => {
    const updatedLeave = await service.update(req.params.id, req.body);

    res.json(new LeaveResponseDto(updatedLeave));
  },
];
```

[&lt; Back To การจัดการฟอร์ม](Form-Management.md) | [Next To HTTP Interceptors &gt; ](HTTP-Interceptors.md)
