# Serializers

### Serialization

Serialization คือกระบวนการแปลงออบเจ็กต์ผ่าน DTO เพื่อให้เกิดผลลัพธ์เป็นข้อมูลที่ต้องการส่งออกนอกระบบไปยัง Client

ก่อนอื่นให้ทำการสร้าง middleware สำหรับการแปลง DTO เป็น response ในไฟล์ `middleware/response-transformer.ts`

```typescript
import { RequestHandler } from 'express';
import { instanceToPlain } from 'class-transformer';

const responseTransformer: RequestHandler = (_req, res, next) => {
  const oldJson = res.json;
  res.json = (body) => {
    if ('errors' in body) return oldJson.call(res, body);

    return oldJson.call(
      res,
      instanceToPlain(body, {
        strategy: 'excludeAll',
      })
    );
  };

  next();
};

export default responseTransformer;
```

จากนั้นจึงทำการเรียกใช้งาน `middleware` นี้ใน `main.ts`

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as path from 'path';
import { setup as setupRoutes } from './routes';
import errorHandler from './middleware/error-handler';
import responseTransformer from './middleware/response-transformer';

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
```

ต่อมาให้ทำการสร้าง DTO เพื่อเป็นตัวแทนของ response ในไฟล์ `dto/leaves/LeaveResponseDto.ts`

```typescript
import { Expose, Transform } from 'class-transformer';
import { LeaveItem } from '../../services/leaves';

export class LeaveResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ value }) => value.toLowerCase())
  status: string;

  @Expose()
  reason: string;

  @Expose()
  leaveDate: string;

  constructor(leave: LeaveItem) {
    Object.assign(this, leave);
  }
}
```

สุดท้ายให้ทำการเรียกใช้ DTO นี้ใน controller บนไฟล์ `controllers/leaves.ts`

```typescript
import { RequestHandler } from 'express';
import * as service from '../services/leaves';
import bodyValidator from '../middleware/body-validator';
import { CreateLeaveFormDto } from '../dto/leaves/CreateLeaveFormDto';
import { EditLeaveFormDto } from '../dto/leaves/EditLeaveFormDto';
import { LeaveResponseDto } from '../dto/leaves/LeaveResponseDto';

export const findOne: RequestHandler = (req, res) => {
  res.json(new LeaveResponseDto(service.findOne(+req.params.id)));
};

export const findAll: RequestHandler = (req, res) => {
  const leaves = service.findAll();

  res.json(leaves.map((l) => new LeaveResponseDto(l)));
};

export const create: RequestHandler[] = [
  bodyValidator(CreateLeaveFormDto),
  (req, res) => {
    const leave = service.create(req.body);

    res.status(201).json(new LeaveResponseDto(leave));
  },
];

export const update: RequestHandler[] = [
  bodyValidator(EditLeaveFormDto),
  (req, res) => {
    const updatedLeave = service.update(+req.params.id, req.body);

    res.json(new LeaveResponseDto(updatedLeave));
  },
];
```

[&lt; Back To การตรวจสอบ Payload ในฟอร์ม](Check-Payload-In-Form.md) | [Next To การจัดการฟอร์ม &gt; ](Form-Management.md)
