# การตรวจสอบ Payload ในฟอร์ม

### การตรวจสอบความถูกต้องของการส่ง Payload

สำหรับการส่งข้อมูล Leave มาเพื่อสร้างหรืออัพเดทเราพบว่าค่าของ id และ status ไม่ควรถูกส่งมา ส่วนค่าของ reason ควรมีชนิดข้อมูลเป็น string และต้องมีการระบุค่าเข้ามาด้วยความยาวขั้นต่ำ 1 ตัวอักษร เพื่อให้การตรวจสอบตรงจุดนี้เกิดขึ้น เราจึงทำการสร้าง Middleware ชื่อ `bodyValidator` เพื่อทำการตรวจสอบส่วนของ Payload พร้อมแปลงข้อมูลให้เหมาะสมแล้วจึงนำส่งไปเป็นค่าของ `req.body` ต่อไป

ก่อนอื่นให้ทำการติดตั้งแพคเกจที่เกี่ยวข้องด้วยคำสั่ง `npm i class-transformer class-validator` จากนั้นจึงสร้างไฟล์ `middleware/body-validator.ts` พร้อมใส่ข้อมูลดังนี้

```typescript
import { RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Type } from '@angular/core';
import { ValidationError } from '../errors/ValidationError';

const bodyValidator =
  <T extends Type<object>>(Dto: T): RequestHandler =>
  async (req, _res, next) => {
    const dto = plainToInstance(Dto, req.body, { strategy: 'excludeAll' });
    const errors = await validate(dto);

    if (errors.length > 0) return next(new ValidationError(errors));

    req.body = dto;
    next();
  };

export default bodyValidator;
```

จากนั้นให้ทำการสร้างไฟล์ `errors/ValidationError.ts` ดังนี้

```typescript
import { ValidationError as Err } from 'class-validator';

export class ValidationError extends Error {
  constructor(public errors: Err[]) {
    super('Validation Error');
  }
}
```

**Data Transfer Object**

การส่งผ่านข้อมูลข้ามระบบเช่นจาก Client สู่ API หรือจาก API สู่ Client ต้องมีการสร้างออบเจ็กต์ประเภทหนึ่งที่เรียกว่า Data Transfer Object หรือ DTO ในการณ์นี้เราจึงทำการสร้าง `CreateLeaveFormDto` และ `EditLeaveFormDto` เพื่อเป็นตัวแทนของข้อมูลจากฝั่ง Client ที่ใช้เพื่อสร้างและอัพเดท Leave ตามลำดับ

ก่อนอื่นให้ทำการติดตั้งแพคเกจที่เกี่ยวข้องผ่านคำสั่ง `npm i @nestjs/mapped-types` จากนั้นจึงสร้างไฟล์ `dto/leaves/CreateLeaveFormDto.ts` ดังนี้

```typescript
import { Expose } from 'class-transformer';
import { IsDateString, Length } from 'class-validator';

export class CreateLeaveFormDto {
  @Expose()
  @IsDateString()
  leaveDate: Date;

  @Expose()
  @Length(1, 255)
  reason: string;
}
```

และสร้างไฟล์ `dto/leaves/EditLeaveFormDto.ts` ดังนี้

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveFormDto } from './CreateLeaveFormDto';

export class EditLeaveFormDto extends PartialType(CreateLeaveFormDto) {}
```

เราจะทำการอัพเดทส่วนของ service ให้มี `leaveDate` ด้วยโดยให้แก้ไขไฟล์ `services/leaves.ts` ดังนี้

```typescript
export type LeaveItem = {
  id: number;
  reason: string;
  leaveDate: Date;
} & ({ status: 'PENDING' | 'ACCEPTED'; rejectedReason?: never } | { status: 'REJECTED'; rejectedReason: string });

const leaveList: LeaveItem[] = [
  { id: 1, reason: 'Reason#1', status: 'PENDING', leaveDate: new Date() },
  { id: 2, reason: 'Reason#2', status: 'ACCEPTED', leaveDate: new Date() },
  {
    id: 3,
    reason: 'Reason#3',
    status: 'REJECTED',
    rejectedReason: 'Reson#1',
    leaveDate: new Date(),
  },
  { id: 4, reason: 'Reason#4', status: 'PENDING', leaveDate: new Date() },
  { id: 5, reason: 'Reason#5', status: 'PENDING', leaveDate: new Date() },
];

export const findOne = (id: LeaveItem['id']) => {
  return leaveList.find((item) => item.id === id);
};

export const findAll = () => {
  return leaveList;
};

export const create = (leave: Omit<LeaveItem, 'id' | 'status'>) => {
  const newLeaveItem = { id: leaveList.length + 1, status: 'PENDING', ...leave } as LeaveItem;

  leaveList.push(newLeaveItem);

  return newLeaveItem;
};

export const update = (id: LeaveItem['id'], leave: Partial<Omit<LeaveItem, 'id' | 'status'>>) => {
  const index = leaveList.findIndex((l) => l.id === id);

  leaveList[index] = { ...leaveList[index], ...leave } as LeaveItem;

  return leaveList[index];
};
```

เราจะทำการเรียกใช้ `bodyValidator` ใน `controllers/leaves.ts`

```typescript
import { RequestHandler } from 'express';
import * as service from '../services/leaves';
import bodyValidator from '../middleware/body-validator';
import { CreateLeaveFormDto } from '../dto/leaves/CreateLeaveFormDto';
import { EditLeaveFormDto } from '../dto/leaves/EditLeaveFormDto';

export const findOne: RequestHandler = (req, res) => {
  res.json(service.findOne(+req.params.id));
};

export const findAll: RequestHandler = (req, res) => {
  res.json(service.findAll());
};

export const create: RequestHandler[] = [
  bodyValidator(CreateLeaveFormDto),
  (req, res) => {
    const leave = service.create(req.body);

    res.status(201).json(leave);
  },
];

export const update: RequestHandler[] = [
  bodyValidator(EditLeaveFormDto),
  (req, res) => {
    const updatedLeave = service.update(+req.params.id, req.body);

    res.json(updatedLeave);
  },
];
```

ท้ายสุดนี้ถ้าการตรวจสอบข้อมูลไม่ผ่านจะเกิด `ValidationError` เราจึงต้องสร้าง error middleware ขึ้นมาไว้จัดการเกี่ยวกับข้อผิดพลาดที่เกิดขึ้น

สร้างไฟล์ `middleware/error-handler.ts`

```typescript
import { ErrorRequestHandler } from 'express';
import { ValidationError } from '../errors/ValidationError';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ errors: err.errors });
  }

  next(err);
};

export default errorHandler;
```

เราจะทำการเรียกใช้งาน error middleware ด้วยการตั้งค่าใน `main.ts` ดังนี้

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as path from 'path';
import { setup as setupRoutes } from './routes';
import errorHandler from './middleware/error-handler';

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: '*',
  })
);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

setupRoutes(app);
app.use(errorHandler);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
```

[&lt; Back To การสร้าง API บน Monorepo](Create-API-On-Monorepo.md) | [Next To Serializers &gt; ](Serializers.md)
