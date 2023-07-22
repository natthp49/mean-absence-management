# Error Handling

### การจัดการ Error ใน Express.js

เราไม่ต้องการจัดการข้อผิดพลาดเองใน controller แต่ต้องการโยนข้อผิดพลาดนั้นออกไป และคาดหวังว่าระบบ Middleware ของ Express.js จะจัดการแปลงข้อผิดพลาดนั้นเป็น Response ได้อย่างถูกต้อง สิ่งที่เราต้องทำจึงเป็นการสร้าง `error-handler.ts`

```ts
import { ErrorRequestHandler } from 'express';
import { QueryFailedError } from 'typeorm';
import { ForbiddenError } from '../error/ForbiddenError';
import { ValidationError } from '../error/ValidationError';
import { HTTP_STATUSES } from '../helper/http-statuses';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({ errors: err.errors });
  }

  if (err instanceof QueryFailedError) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({ errors: err.message });
  }

  if (err instanceof ForbiddenError) {
    res.status(HTTP_STATUSES.FORBIDDEN).json({ errors: err.message });
  }

  next(err);
};

export default errorHandler;
```

```ts
// ...
app.use(responseTransformer);
setupAuth();
setupRoutes(app);
app.use(errorHandler);
// ...
```

[&lt; Back To Serializer](Serializer.md) | [Next To สไลด์เรื่อง Authentication / Authorization &gt; ](Slide-Authentication_Authorization.md)
