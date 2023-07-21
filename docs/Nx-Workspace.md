# Nx Workspace

### การสร้าง Monorepo ด้วย Nx

Monorepo เป็นหลักการในการสร้างโปรเจคที่หนึ่ง Repository สามารถประกอบได้ด้วยหลายโปรเจคย่อย สำหรับคอร์สนี้เราจะใช้ Nx เป็นเครื่องมือในการสร้างการทำงานแบบ Monorepo ก่อนอื่นให้ทำการเริ่มต้นสร้าง Monorepo นี้ผ่าน Nx

```powershell
$ npx create-nx-workspace@latest absence-management
Need to install the following packages:
  create-nx-workspace@16.4.0
Ok to proceed? (y) y

>  NX   Let's create a new workspace [https://nx.dev/getting-started/intro]

✔ Which stack do you want to use? · None
✔ Standalone project or integrated monorepo? · integrated
✔ Enable distributed caching to make your CI faster · No

>  NX   Creating your v16.4.0 workspace.

  To make sure the command works reliably in all environments, and that the preset is applied correctly,
  Nx will run "npm install" several times. Please wait.
```

เมื่อรันคำสั่งดังกล่าวเสร็จสิ้นจะได้โปรเจคที่มีโครงสร้างตามนี้

[![workspace](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/workspace.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/workspace.png)

เพื่อให้การทำงานกับ Nx เป็นไปได้โดยง่าย ให้ทำการติดตั้ง Extension ของ VSCode ในชื่อของ Nx Console

[![nx-console](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/nx-console.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/nx-console.png)

ลำดับถัดมาเราจะทำการสร้างแอพพลิเคชันด้วย Angular โดยใช้ชื่อโปรเจคว่า Leave ก่อนอื่นให้ทำการติดตั้งเครื่องมือจัดการ Angular ผ่านคำสั่ง `npm i -D @nx/angular` แล้วจึงทำการเปิด Nx Console และเลือกคำสั่ง generate ดังนี้

[![nx-generate-command](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/nx-generate-command.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/nx-generate-command.png)

จากนั้นจึงเลือก `@nx/angular - application` พร้อมกำหนดค่าต่าง ๆ ดังนี้

- name: `leave`
- routing: เลือก
- standalone: เลือก
- addTailwind: เลือก
- port: `4201`
- style: `scss`

จากนั้นจึงกดปุ่ม Generate เราจะได้ผลลัพธ์เป็นโปรเจคใหม่ชื่อ `leave` ภายใต้โฟลเดอร์ `app`

[![angular-app](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/angular-app.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/angular-app.png)

เราจะทำการทดสอบผลลัพธ์ด้วยการรันโปรเจค Angular ขึ้นมา โดยไปที่ Nx Console แล้วเลือกคำสั่ง serve จากโปรเจค leave หากไม่มีรายชื่อโปรเจคปรากฎให้กดปุ่ม reload ก่อน

[![serve](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/serve.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/serve.png)

เมื่อโปรแกรมทำงานเสร็จสิ้นจะสามารถเข้าสู่หน้าเว็บของเราได้ที่ `http://localhost:4201/`

### Settings และ Extensions ที่จำเป็น

สำหรับคอร์สนี้แนะนำให้่ติดตั้ง Extensions ของ VSCode ดังต่อไปนี้ คือ

- Prettier
- Ex Console
- Angular Language Service
- Tailwind CSS IntelliSense
- Thunder Client
- ESLint

จากนั้นจึงทำการตั้งค่าโปรเจคผ่านไฟล์ `.vscode/settings.json` ดังนี้

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "files.associations": {
    "*.scss": "tailwindcss"
  },
  "thunder-client.saveToWorkspace": true
}
```

**การสร้างคอมโพแนนท์**

เราจะเริ่มต้นสร้างคอมโพแนนท์ผ่าน Nx Console ด้วยการเลือกคำสั่ง generate แล้วตามด้วย `@nx/angular - component` พร้อมกำหนดรายละเอียดต่าง ๆ ดังนี้

- name: `leaves/components/leave-list`
- project: `leave`
- standalone: เลือก

จากนั้นจึงทำการกด Generate เมื่อเสร็จสิ้นจะได้ผลลัพธ์เป็นไฟล์ของคอมโพแนนท์ภายใต้โครงสร้างนี้

```powershell
|- apps
    |- leave
        |- src
            |- app
                |- leaves
                    |- components
                        |- leave-list.component.html
                        |- leave-list.component.scss
                        |- leave-list.component.ts
```

เราจะทำการสร้างชนิดข้อมูลสำหรับฟีเจอร์ `leaves` ภายใต้ไฟล์ `leaves/leave.model.ts` ดังนี้

```typescript
export type LeaveItem = {
  id: number;
  reason: string;
} & ({ status: 'PENDING' | 'ACCEPTED'; rejectedReason?: never } | { status: 'REJECTED'; rejectedReason: string });
```

เมื่อเสร็จสิ้นเราจะทำการจำลองข้อมูลของ Leave Items ภายใต้ `leave-list.component.ts` คือ

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';

@Component({
  selector: 'absence-management-leave-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
})
export class LeaveListComponent {
  leaveItems: LeaveItem[] = [
    {
      id: 1,
      reason: 'Reason#1',
      status: 'ACCEPTED',
    },
    {
      id: 2,
      reason: 'Reason#2',
      status: 'PENDING',
    },
    {
      id: 3,
      reason: 'Reason#3',
      status: 'REJECTED',
      rejectedReason: 'REJECTED REASON',
    },
  ];
}
```

เราจะนำข้อมูลของ `leaveItems` นี้ไปแสดงผลในไฟล์ `leave-list.component.html` ด้วยโค้ดต่อไปนี้

```html
<div class="max-w-3xl mx-auto">
  <h2 class="text-center text-green-700 text-3xl my-2">All Leaves</h2>
  <section class="grid grid-cols-3 gap-2">
    <article *ngFor="let leave of leaveItems">
      <h3>{{ leave.reason }}</h3>
      <p>{{ leave.status }}</p>
      <p *ngIf="leave.status === 'REJECTED'">{{ leave.rejectedReason }}</p>
    </article>
  </section>
</div>
```

สุดท้ายเราจึงนำคอมโพแนนท์ `LeaveListComponent` นี้ไปแสดงผลบน `AppComponent` อีกครั้งในไฟล์ `app.component.html`

```html
<absence-management-leave-list></absence-management-leave-list> <router-outlet></router-outlet>
```

พร้อมทั้งทำการระบุ `LeaveListComponent` ในประโยค imports ของ `AppComponent`

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeaveListComponent } from './leaves/components/leave-list/leave-list.component';

@Component({
  standalone: true,
  imports: [LeaveListComponent, RouterModule],
  selector: 'absence-management-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'leave';
}
```

**Input และการสื่อสารระหว่างคอมโพแนนท์**

เราจะแยกส่วนของ Leave Item ออกจาก `LeaveListComponent` ไปเป็นอีกหนึ่งคอมโพแนนท์ ให้ทำการใช้ Nx Console เพื่อสร้างคอมโพแนนท์โดยระบุส่วนประกอบต่าง ๆ ดังนี้

- name: `leaves/components/leave-item`
- project: `leave`
- standalone: เลือก

ทำการย้ายส่วนของ `LeaveItem` จาก `LeaveListComponent` มาสู่ไฟล์ `leave-item.component.html` ดังนี้

```html
<article>
  <h3>{{ leave.reason }}</h3>
  <p>{{ leave.status }}</p>
  <p *ngIf="leave.status === 'REJECTED'">{{ leave.rejectedReason }}</p>
</article>
```

พร้อมกันนี้ให้ทำการระบุส่วนของ `Input` ในไฟล์ `leave-item.component.ts` ด้วยเช่นกัน

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';

@Component({
  selector: 'absence-management-leave-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-item.component.html',
  styleUrls: ['./leave-item.component.scss'],
})
export class LeaveItemComponent {
  @Input({ required: true }) leave!: LeaveItem;
}
```

สุดท้ายให้ทำการ `import` ส่วนของ `LeaveItemComponent` ในไฟล์ `leave-list.component.ts` ดังนี้

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';
import { LeaveItemComponent } from '../leave-item/leave-item.component';

@Component({
  selector: 'absence-management-leave-list',
  standalone: true,
  imports: [CommonModule, LeaveItemComponent],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
})
```

**Service Layer**

คอมโพแนนท์แท้จริงแล้วคือส่วนแสดงผลจึงไม่ควรมี Logic ที่ไม่สัมพันธ์กับการแสดงผลโดยตรงอยู่ในคอมโพแนนท์ เราจึงจะทำการแยกส่วนของ `leaveItems` ไปไว้ในอีกหนึ่งส่วนที่เราจะเรียกมันว่า Services

ทำการสร้าง Service โดยการใช้ Nx Console ด้วยการเลือกเมนู Generate ต่อด้วย `@schematics/angular - service` พร้อมทำการระบุส่วนต่าง ๆ ดังนี้

- name: `leaves/leave`
- project: `leave`

ทำการย้าย `leaveItems` จาก `leave-list.component.ts` ไปไว้ที่ `leave.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { LeaveItem } from './leave.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  items: LeaveItem[] = [
    {
      id: 1,
      reason: 'Reason#1',
      status: 'ACCEPTED',
    },
    {
      id: 2,
      reason: 'Reason#2',
      status: 'PENDING',
    },
    {
      id: 3,
      reason: 'Reason#3',
      status: 'REJECTED',
      rejectedReason: 'REJECTED REASON',
    },
  ];
}
```

ทำการเรียกใช้ `LeaveSerive` ใน `leave-list.component.ts` ดังนี้

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
}
```

ทำการเปลี่ยนแปลงโค้ด `leave-list.component.html` เพื่อเรียกใช้ items จาก service ดังกล่าว

```html
<div class="max-w-3xl mx-auto">
  <h2 class="text-center text-green-700 text-3xl my-2">All Leaves</h2>
  <section class="grid grid-cols-3 gap-2">
    <absence-management-leave-item *ngFor="let leave of leaveService.items" [leave]="leave"></absence-management-leave-item>
  </section>
</div>
```

**การใช้งาน RouterModule**

ในส่วนนี้เราจะทำการสร้างหน้าจอสองหน้า หน้าแรกเป็นการแสดงผล Leave Items ทั้งหมดเมื่อเข้าถึงผ่าน `/leaves` ส่วนอีกหน้าเป็นหน้าสำหรับการแสดงผลรายละเอียดของ Leave โดยสามารถเข้าถึงหน้านี้ได้จาก `/leaves/:id` เมื่อ `:id` คือส่วนของ ID ของ Leave ที่เราสนใจ

ก่อนอื่นให้ทำการสร้างคอมโพแนนท์ `LeaveDetailsComponent` โดยใช้ Nx Console ผ่านการกำหนดค่าต่าง ๆ ดังนี้

- name: `leaves/components/leave-details`
- project: `leave`
- standalone: เลือก

จากนั้นจึงทำการสร้างเมธอด `getLeaveById` บน `LeaveService` ดังนี้

```typescript
import { Injectable } from '@angular/core';
import { LeaveItem } from './leave.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  items: LeaveItem[] = [
    {
      id: 1,
      reason: 'Reason#1',
      status: 'ACCEPTED',
    },
    {
      id: 2,
      reason: 'Reason#2',
      status: 'PENDING',
    },
    {
      id: 3,
      reason: 'Reason#3',
      status: 'REJECTED',
      rejectedReason: 'REJECTED REASON',
    },
  ];

  getLeaveById(id: number) {
    return this.items.find((item) => item.id === id);
  }
}
```

แล้วจึงทำการเรียกใช้เมธอดดังกล่าวเมื่อมีการกำหนดค่า id บนคอมโพแนนท์ `leave-details.component.ts`

```typescript
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';
import { LeaveService } from '../../leave.service';

@Component({
  selector: 'absence-management-leave-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-details.component.html',
  styleUrls: ['./leave-details.component.scss'],
})
export class LeaveDetailsComponent {
  leaveService = inject(LeaveService);
  leave?: LeaveItem;

  @Input() set id(value: string) {
    this.leave = this.leaveService.getLeaveById(+value);
  }
}
```

พร้อมทำการแสดงผลข้อมูลผ่าน `leave-details.component.html`

```html
<dl *ngIf="leave">
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

จากนั้นจึงทำการนิยาม Routes ต่าง ๆ ภายใต้ไฟล์ `app.routes.ts`

```typescript
import { Route } from '@angular/router';
import { LeaveListComponent } from './leaves/components/leave-list/leave-list.component';
import { LeaveDetailsComponent } from './leaves/components/leave-details/leave-details.component';

export const appRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'leaves',
        children: [
          {
            path: '',
            component: LeaveListComponent,
          },
          {
            path: ':id',
            component: LeaveDetailsComponent,
          },
        ],
      },
    ],
  },
];
```

สุดท้ายจึงตั้งค่าให้ Dynamic Params ใด ๆ สามารถส่งไปยังคอมโพแนนท์ผ่าน Input ได้ โดยให้ทำการตั้งค่าใน `app.config.ts` ดังนี้

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withComponentInputBinding()), provideAnimations()],
};
```

ทำการแก้ไขให้ `LeaveItem` แต่ละตัวสามารถกดคลิกเพื่อเปลี่ยนไปยัง `/leaves/:id` ได้ โดยเข้าไปแก้ไขที่ `leave-item.component.html`

```html
<a [routerLink]="['/leaves', leave.id]">
  <article>
    <h3>{{ leave.reason }}</h3>
    <p>{{ leave.status }}</p>
    <p *ngIf="leave.status === 'REJECTED'">{{ leave.rejectedReason }}</p>
  </article>
</a>
```

พร้อมกันนี้ให้ทำการเพิ่ม `RouterModule` เข้าไปยังประโยค imports ของ `leave-item.component.ts` ด้วย

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'absence-management-leave-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leave-item.component.html',
  styleUrls: ['./leave-item.component.scss'],
})
export class LeaveItemComponent {
  @Input({ required: true }) leave!: LeaveItem;
}
```

**การใช้งาน Angular Material**

พื่อให้การจัดสไตล์คอมโพแนนท์เป็นไปอย่างสวยงามมากขึ้น เราจะใช้ Angular Material อันเป็น UI Framework ยอมนิยมในโลกของ Angular เพื่อใช้งานคอมโพแแนท์ต่าง ๆ ในระบบของ Material ในการจัดรูปแบบการแสดงผลอย่างสวยงาม

เริ่มต้นด้วยการติดตั้ง Angular Material ผ่านคำสั่ง `npm i -D @angular/material` เมื่อเสร็จเรียบร้อยให้ออกคำสั่งดังนี้ต่อไป

```ps1
$ npx nx generate @angular/material:ng-add --project=leave

Choose a prebuilt theme name, or "custom" for a custom theme: · indigo-pink
Set up global Angular Material typography styles? (y/N) · true
Include the Angular animations module? · enabled
```

เราจะทำการสร้างส่วนของ Header บน `AppComponent` ก่อนอื่นให้ทำการ imports `MatToolbarModule` เข้ามาก่อนใน ` app.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  standalone: true,
  imports: [RouterModule, MatToolbarModule],
  selector: 'absence-management-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'leave';
}
```

ทำการแก้ไข `app.component.html` ดังนี้

```html
<mat-toolbar color="primary" class="space-x-2">
  <a routerLink="/">Home</a>
  <a routerLink="/leaves" routerLinkActive="underline underline-offset-4">Leaves</a>
</mat-toolbar>
<router-outlet></router-outlet>
```

สุดท้ายเราจะจัดสไตล์ของ `LeaveItem` แต่ละตัวให้แสดงผลเป็น Card โดยใช้งาน `MatCardModule` ใน `leave-item.component.ts` ดังนี้

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveItem } from '../../leave.model';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'absence-management-leave-item',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule],
  templateUrl: './leave-item.component.html',
  styleUrls: ['./leave-item.component.scss'],
})
export class LeaveItemComponent {
  @Input({ required: true }) leave!: LeaveItem;
}
```

จากนั้นจึงทำการแก้ไข `leave-item.component.html` ต่อไป

```html
<section class="grid grid-cols-2 gap-2 my-4 mx-auto max-w-4xl">
  <mat-card *ngFor="let leave of leaveList$ | async">
    <mat-card-header>
      <mat-card-subtitle>
        <span [class]="getStatusClasses(leave.status)"> {{ leave.status }} </span>
      </mat-card-subtitle>
      <mat-card-title>{{ leave.leaveDate | date : 'fullDate' }}</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <p>{{ leave.reason }}</p>
      <mat-divider></mat-divider>
    </mat-card-content>
    <mat-card-actions *ngIf="isPending(leave)">
      <a mat-button [routerLink]="['/leaves', leave.id, 'edit']">EDIT</a>
      <button mat-button (click)="remove(leave.id)">REMOVE</button>
    </mat-card-actions>
    <mat-card-footer> </mat-card-footer>
  </mat-card>
</section>
```

ผลลัพธ์จากการแก้ไขนี้จะได้การแสดงผล Leave Item แต่ละตัวออกมาในรูปแบบของ Card

[![card](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/card.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/card.png)

[&lt; Back To การตั้งค่า Git Bash บน Integrated Terminal](Setting-Git-Bash-On-Integrated-Terminal.md) | [Next To การสร้าง API บน Monorepo &gt; ](Nx-Workspace.md)
