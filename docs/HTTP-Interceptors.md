# HTTP Interceptors

### HTTP Interceptors

เราสามารถใช้ HTTP Interceptors เพื่อเปลี่ยนแปลงพฤติกรรมของ `HttpClient` ได้ เช่น กำหนดส่วนของ Base URL หรือใช้พิจารณาข้อผิดพลาด เช่น หาก response จาก API Server เป็น 403 ให้ redirect ไปยัง `/forbidden` เป็นต้น

เราจะเรียกการทำงานที่เกี่ยวข้องกับการดึงข้อมูลว่า fetcher และเนื่องจากส่วนนี้เป็นส่วนประกอบที่สามารถไปปรากฎยังแอพพลิเคชันได้หลากหลายเราจึงต้องทำการสร้าง fetcher ในฐานะที่เป็น lib ตัวนึงที่สามารถนำกลับมาใช้ซ้ำในแอพพลิเคชันของ Angular ต่าง ๆ ได้

ทำการสร้าง lib ของ Angular ผ่าน Nx Console โดยทำการเลือก generate แล้วไปที่ `@nx/angular - library` พร้อมทำการเติมข้อมูลในส่วนประกอบต่าง ๆ ดังนี้

name: `fetcher`
standalone: เลือก

ทำการสร้าง interceptor ในชื่อของ `fetcher.interceptor.ts` ผ่าน Nx Console โดยทำการเลือก generate แล้วไปที่ `@schematics/angular - interceptor` พร้อมระบุข้อมูลต่าง ๆ ดังนี้

name: `interceptors/fetcher`
project: `fetcher`
functional: เลือก

จากนั้นทำการเปิดไฟล์ `fetcher.interceptor.ts` แล้วทำการอัพเดทข้อมูลดังนี้

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const fetcherInterceptor: HttpInterceptorFn = (req, next) => {
  return next(
    req.clone({
      url: `${import.meta.env.NG_APP_API_URL}${req.url}`,
    })
  );
};
```

ทำการอัพเดทไฟล์ `libs/fetcher/src/index.ts` ดังนี้

```typescript
export * from './lib/interceptors/fetcher.interceptor';
```

ทำการอัพเดทชนิดข้อมูลของ env ด้วยการสร้างไฟล์ `src/types/env.d.ts`

```typescript
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly NG_APP_ENV: string;
  readonly NG_APP_API_URL: string;
}
```

สุดท้ายทำการตั้งค่า interceptor ด้วยการเรียกใช้ในแอพ leave ผ่านไฟล์ `app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { fetcherInterceptor } from '@absence-management/fetcher';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withComponentInputBinding()), provideHttpClient(withInterceptors([fetcherInterceptor])), provideAnimations()],
};
```

ถึงตอนนี้ก็พร้อมที่จะเอา Base URL ออกจาก service แล้ว เราสามารถเข้าถึง endpoints ต่าง ๆ ของ API โดยไม่จำเป็นต้องระบุเป็น URL เต็มอีกต่อไป

แก้ไขไฟล์ `leaves.service.ts` ดังนี้

```typescript
import { Injectable, inject } from '@angular/core';
import { LeaveForm, LeaveItem } from './leave.model';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  http = inject(HttpClient);

  getLeaveList() {
    return this.http.get<LeaveItem[]>('/leaves');
  }

  getLeaveById(id: number) {
    return this.http.get<LeaveItem>(`/leaves/${id}`);
  }

  create(form: LeaveForm) {
    return this.http.post<LeaveItem>('/leaves', form);
  }

  update(id: string, form: LeaveForm) {
    return this.http.patch<LeaveItem>(`/leaves/${id}`, form);
  }
}
```

[&lt; Back To การเชื่อมต่อฐานข้อมูล MongoDB](Connect-Mongodb.md) | [Next To Auth API &gt; ](Auth-API.md)
