# Serializer

### Serializer

ในการคืนค่า Reponse จาก Express.js เราต้องการดักจับออบเจ็กต์ให้คืนเฉพาะค่าที่เราสนใจ และในบางครั้งเรายังต้องการแปลงข้อมูลของแต่ละพร็อพเพอร์ตี้ก่อนจัดส่งกลับสู่ Client อีกด้วย

เราจะใช้แพคเกจ `class-transformer` ในการจัดการปัญหาดังกล่าวผ่าน Middleware ชื่อ `response-transformer.ts`

```ts
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

จากนั้นทำการติดตั้ง Middleware ตัวนี้ใน `main.ts`

```ts
// ...
app.use(responseTransformer);
setupAuth();
setupRoutes(app);
app.use(errorHandler);
// ...
```

ตัวอย่าง DTO ที่เป็นตัวแทนของ Response

```ts
import { Leave, Status } from '@/api/entity/Leave';
import { User } from '@/api/entity/User';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../users/UserResponseDto';

export class LeaveResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: Status;

  @Expose()
  reason: string;

  @Expose()
  leaveDate: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: User;

  @Expose()
  @Type(() => UserResponseDto)
  approvedBy: User;

  constructor(leave: Leave) {
    Object.assign(this, leave);
  }
}
```

[&lt; Back To Form Validator](Form-Validator.md) | [Next To Error Handling &gt; ](Error-Handling.md)
