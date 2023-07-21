# การสร้าง API บน Monorepo

### การเชื่อมต่อ API

ในบทเรียนนี้เราจะทำการสร้างโปรเจคย่อยคือ API ภายใต้ Monorepo ของเราโดยใช้ Express.js เป็นส่วนจัดการ API

**การสร้างโปรเจค Express**

เริ่มต้นด้วยการออกคำสั่ง `npm i -D @nx/express` เพื่อติดตั้งเครื่องมือสำหรับการสร้างโปรเจค Express จากนั้นให้ใช้ Nx Console เพื่อทำการสร้างโปรเจคใหม่โดยเลือกเมนู Generate ต่อด้วย `@nx/express - application` พร้อมระบุข้อมูลต่อไปนี้

- name: `api`

เราใช้โครงสร้างต่อไปนี้ในการสร้างโปรเจคนี้ของเรา

```powershell
|- apps
    |- api
        |- src
            |- controllers
                |- leaves.ts
            |- routes
                |- index.ts
                |- v1.ts
            |- services
                |- leaves.ts
            |- main.ts
```

ทำการสร้างไฟล์ต่าง ๆ พร้อมทำการระบุข้อมูลดังนี้

ไฟล์ `main.ts`

```typescript
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { setup as setupRoutes } from './routes';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

setupRoutes(app);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
```

ไฟล์ `services/leaves.ts`

```typescript
export type LeaveItem = {
  id: number;
  reason: string;
} & ({ status: 'PENDING' | 'ACCEPTED'; rejectedReason?: never } | { status: 'REJECTED'; rejectedReason: string });

const leaveList: LeaveItem[] = [
  { id: 1, reason: 'Reason#1', status: 'PENDING' },
  { id: 2, reason: 'Reason#2', status: 'ACCEPTED' },
  { id: 3, reason: 'Reason#3', status: 'REJECTED', rejectedReason: 'Reson#1' },
  { id: 4, reason: 'Reason#4', status: 'PENDING' },
  { id: 5, reason: 'Reason#5', status: 'PENDING' },
];

export const findOne = (id: LeaveItem['id']) => {
  return leaveList.find((item) => item.id === id);
};

export const findAll = () => {
  return leaveList;
};
```

ไฟล์ `routes/index.ts`

```typescript
import express, { Express } from 'express';
import * as v1 from './v1';

export const setup = (app: Express) => {
  const v1Routes = express.Router();
  v1.setup(v1Routes);
  app.use('/v1', v1Routes);
};
```

ไฟล์ `routes/v1.ts`

```typescript
import express from 'express';
import * as controller from '../controllers/leaves';

export const setup = (router: express.Router) => {
  router.get('/leaves', controller.findAll);
  router.get('/leaves/:id', controller.findOne);
};
```

ไฟล์ `controllers/leaves.ts`

```typescript
import { RequestHandler } from 'express';
import * as service from '../services/leaves';

export const findOne: RequestHandler = (req, res) => {
  res.json(service.findOne(+req.params.id));
};

export const findAll: RequestHandler = (req, res) => {
  res.json(service.findAll());
};
```

**การเรียกใช้ API จาก Angular**

ก่อนที่จะให้ฝั่ง Angular เรียกใช้ API ได้ เราจะทำการนิยาม `API_URL` เป็น Environment Variables ภายใต้ไฟล์ชื่อ `.env` ก่อน โดยให้ทำการติดตั้งแพคเกจคือ `@ngx-env/builder` ผ่านคำสั่ง `npm i -D @ngx-env/builder`

จากนั้นให้ทำการเปิดไฟล์ `project.json` ภายใต้โปรเจค `leave` แล้วจึงแทนที่ `@angular-devkit/build-angular` ด้วย `@ngx-env/builder`

ลำดับถัดมาให้ทำการสร้างไฟล์ `.env` ในโปรเจค `leave` พร้อมใส่ข้อมูลนี้

```dotenv
NG_APP_ENV=development
NG_APP_API_URL=http://localhost:3333/v1
```

ลำดับถัดมาเราจะใช้ `HttpClient` ในการเข้าถึง API ให้ทำการแก้ไขไฟล์ `leave.service.ts` ของโปรเจค `leave` ดังนี้

```typescript
import { Injectable, inject } from '@angular/core';
import { LeaveItem } from './leave.model';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  http = inject(HttpClient);

  getLeaveList() {
    return this.http.get<LeaveItem[]>(`${import.meta.env.NG_APP_API_URL}/leaves`);
  }

  getLeaveById(id: number) {
    return this.http.get<LeaveItem>(`${import.meta.env.NG_APP_API_URL}/leaves/${id}`);
  }
}
```

ต่อมาจึงทำการเปลี่ยนแปลง `LeaveListComponent` ทั้งส่วนของ HTML และ TypeScript ดังนี้

ไฟล์ `leave-list.component.html`

```html
<div class="max-w-3xl mx-auto">
  <h2 class="text-center text-green-700 text-3xl my-2">All Leaves</h2>
  <section class="grid grid-cols-3 gap-2">
    <absence-management-leave-item *ngFor="let leave of leaveList$ | async" [leave]="leave"></absence-management-leave-item>
  </section>
</div>
```

ไฟล์ `leave-list.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItemComponent } from '../leave-item/leave-item.component';
import { LeaveService } from '../../leave.service';

@Component({
  selector: 'absence-management-leave-list',
  standalone: true,
  imports: [CommonModule, LeaveItemComponent],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
})
export class LeaveListComponent {
  leaveService = inject(LeaveService);
  leaveList$ = this.leaveService.getLeaveList();
}
```

จากนั้นจึงดำเนินการต่อด้วยการแก้ไข `LeaveDetailsComponent` ดังนี้

ไฟล์ `leave-details.component.ts`

```typescript
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';
import { LeaveService } from '../../leave.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'absence-management-leave-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-details.component.html',
  styleUrls: ['./leave-details.component.scss'],
})
export class LeaveDetailsComponent {
  leaveService = inject(LeaveService);
  leave$?: Observable<LeaveItem>;

  @Input() set id(value: string) {
    this.leave$ = this.leaveService.getLeaveById(+value);
  }
}
```

ไฟล์ `leave-details.component.html`

```html
<dl *ngIf="leave$ | async as leave">
  <dt>ID</dt>
  <dd>{{ leave.id }}</dd>
  <dt>Reason</dt>
  <dd>{{ leave.reason }}</dd>
  <dt>Status</dt>
  <dd>{{ leave.status }}</dd>
  <dt>Rejected Reason</dt>
  <dd>{{ leave.rejectedReason }}</dd>
</dl>
```

เพื่อให้เราสามารถใช้ `HttpClient` ได้ ต้องทำการแก้ไขไฟล์ `app.config.ts` ดังนี้

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withComponentInputBinding()), provideHttpClient(), provideAnimations()],
};
```

ท้ายสุดนี้เราต้องตั้งค่า CORS บนโปรเจค API โดยให้ทำการติดตั้งแพ็ตเกจผ่านคำสั่ง `npm i cors` และ `npm i -D cors` จากนั้นจึงแก้ไขไฟล์ `main.ts` ดังนี้

```typescript
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { setup as setupRoutes } from './routes';

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

setupRoutes(app);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
```

**การสร้างและการอัพเดท Leave**

เราจะทำการสร้าง Endpoint `POST /leaves` สำหรับการสร้าง `Leave` ใหม่และสร้าง `PATCH /leaves/:id` สำหรับการอัพเดท `Leave` เดิม โดยก่อนอื่นให้ทำการสร้างส่วนนี้ใน service ของ Leave ก่อนใน `services/leaves.ts`

```typescript
export type LeaveItem = {
  id: number;
  reason: string;
} & ({ status: 'PENDING' | 'ACCEPTED'; rejectedReason?: never } | { status: 'REJECTED'; rejectedReason: string });

const leaveList: LeaveItem[] = [
  { id: 1, reason: 'Reason#1', status: 'PENDING' },
  { id: 2, reason: 'Reason#2', status: 'ACCEPTED' },
  { id: 3, reason: 'Reason#3', status: 'REJECTED', rejectedReason: 'Reson#1' },
  { id: 4, reason: 'Reason#4', status: 'PENDING' },
  { id: 5, reason: 'Reason#5', status: 'PENDING' },
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

ทำการอัพเดทส่วนของ controller ในไฟล์ `controllers/leaves.ts` ดังนี้

```typescript
import { RequestHandler } from 'express';
import * as service from '../services/leaves';

export const findOne: RequestHandler = (req, res) => {
  res.json(service.findOne(+req.params.id));
};

export const findAll: RequestHandler = (req, res) => {
  res.json(service.findAll());
};

export const create: RequestHandler = (req, res) => {
  const leave = service.create(req.body);

  res.status(201).json(leave);
};

export const update: RequestHandler = (req, res) => {
  const updatedLeave = service.update(+req.params.id, req.body);

  res.json(updatedLeave);
};
```

เพื่อให้ `req.body` มีค่าตาม Payload ที่ส่งเข้ามาต้องทำการติดตั้ง Middleware คือ `body-parser` ผ่านคำสั่ง `npm i body-parser` และทำการเรียกใช้ Middleware นี้ในไฟล์ `main.ts` ดังนี้

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as path from 'path';
import { setup as setupRoutes } from './routes';

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: '*',
  })
);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

setupRoutes(app);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
```

สุดท้ายให้ทำการอัพเดท `routes` ในไฟล์ `v1.ts`

```typescript
import express from 'express';
import * as controller from '../controllers/leaves';

export const setup = (router: express.Router) => {
  router.get('/leaves', controller.findAll);
  router.get('/leaves/:id', controller.findOne);
  router.post('/leaves', controller.create);
  router.patch('/leaves/:id', controller.update);
};
```

[&lt; Back To Nx Workspace](Nx-Workspace.md) | [Next To การตรวจสอบ Payload ในฟอร์ม &gt; ](Check-Payload-In-Form.md)
