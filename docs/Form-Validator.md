# Form Validator

### Form Validator

เมื่อส่วนของ Payload มาถึง Server ก่อนที่เราจะประมวลผลสิ่งใดต่อเราควรทำการ Validate ข้อมูลในฟอร์มนั้นให้เรียบร้อยเสียก่อน ในที่นี้เราจะใช้สองแพคเกจเพื่อจัดการสิ่งนี้ ให้ทำการติดตั้งแพคเกจตามคำสั่งนี้

```ps1
yarn add class-transformer class-validator
```

ก่อนอื่นจะเริ่มด้วยการสร้าง Error ที่เป็นตัวแทนของข้อผิดพลาดในชื่อของ `ValidationError` ในไฟล์ `errors/ValidationError.ts` ดังนี้

```ts
import { ValidationError as Err } from 'class-validator';

export class ValidationError extends Error {
  constructor(public errors: Err[]) {
    super('Validation Error');
  }
}
```

ลำดับถัดไปคือการสร้าง Middleware ในชื่อของ `body-validator.ts`

```ts
import { RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Type } from '@/api/helper/Type';
import { ValidationError } from '@/api/error/ValidationError';

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

สุดท้ายคือการเรียกใช้ Middleware นี้ในส่วนที่ต้องการใช้งาน

```ts
export const create: RequestHandler[] = [
  authenticator.accessToken,
  bodyValidator(CreateLeaveFormDto),
  async (req, res) => {
    const leave = await service.create(req.userFromToken.id, req.body);

    res.json(new LeaveResponseDto(leave));
  },
];
```

ตัวอย่างของ DTO ที่ใช้ประกอบการ validate ข้อมูล เช่น

```ts
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

[&lt; Back To สไลด์เรื่อง Express](Slide-Express.md) | [Next To Serializer &gt; ](Serializer.md)
