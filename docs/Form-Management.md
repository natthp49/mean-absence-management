# การจัดการฟอร์ม

### การจัดการฟอร์ม

ในบทเรียนนี้เราจะทำการสร้างฟอร์มพร้อมตรวจสอบข้อมูลในฟอร์มด้วย Angular พร้อมทำการจัดส่งข้อมูลไปยัง API Server

ก่อนอื่นให้ทำการสร้างปุ่มที่เมื่อคลิกแล้วจะทำการเปลี่ยนไปสู่หน้าฟอร์มสำหรับสร้าง Leave ตัวใหม่ที่พาธ `/leaves/new`

แก้ไข `leave-list.component.html` พร้อมทำการ `import` โมดูลสำหรับการสร้างปุ่มคือ `MatButtonModule` และ `MatIconModule` ดังนี้

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LeaveItemComponent } from '../leave-item/leave-item.component';
import { LeaveService } from '../../leave.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'absence-management-leave-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule, LeaveItemComponent],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
})
export class LeaveListComponent {
  leaveService = inject(LeaveService);
  leaveList$ = this.leaveService.getLeaveList();
}
```

ทำการสร้างคอมโพแนนท์ชื่อ `CreateLeaveComponent` โดยไปที่ Nx Console เพื่อสร้างคอมโพแนนท์โดยระบุส่วนประกอบต่าง ๆ ดังนี้

- name: `leaves/components/create-leave`
- project: `leave`
- standalone: เลือก

จากนั้นทำการเปิดไฟล์ `app.routes.ts` แล้วทำการระบุ route สำหรับ `/leaves/new` ดังนี้

```typescript
import { Route } from '@angular/router';
import { LeaveListComponent } from './leaves/components/leave-list/leave-list.component';
import { LeaveDetailsComponent } from './leaves/components/leave-details/leave-details.component';
import { CreateLeaveComponent } from './leaves/components/create-leave/create-leave.component';

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
            path: 'new',
            component: CreateLeaveComponent,
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

[![create-button](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/create-button.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/create-button.png)

เนื่องจากหน้าสำหรับการสร้าง Leave และหน้าสำหรับการแก้ไข Leave มีลักษณะแบบเดียวกัน เราจึงทำการแยกส่วนแสดงผลฟอร์มออกมาเป็นคอมโพแนนท์ใหม่ในชื่อของ `LeaveFormComponent`

ทำการสร้างคอมโพแนนท์ชื่อ `LeaveFormComponent` โดยไปที่ Nx Console เพื่อสร้างคอมโพแนนท์โดยระบุส่วนประกอบต่าง ๆ ดังนี้

- name: `leaves/components/leave-form`
- project: `leave`
- standalone: เลือก

ลำดับถัดไปเราจะสร้างคอมโพแนนท์ชื่อ `EditLeaveComponent` โดยไปที่ Nx Console เพื่อสร้างคอมโพแนนท์โดยระบุส่วนประกอบต่าง ๆ ดังนี้

- name: `leaves/components/edit-leave`
- project: `leave`
- standalone: เลือก

`CreateLeaveComponent` และ `EditLeaveComponent` มีความแตกต่างกัน เช่น ชื่อหัวข้อ และการแสดงผลค่าก่อนหน้า ถ้าเป็น `EditLeaveComponent` จะต้องมีการโหลดข้อมูล Leave ที่มีอยู่เดิมมาแสดงผลก่อนในขณะที่ `CreateLeaveComponent` ไม่ต้อง

เราจะเริ่มต้นการทำงานของ `LeaveFormComponent` โดยเริ่มต้นจากส่วนของไฟล์ `leave-form.component.ts` ดังนี้

```typescript
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { LeaveItem, LeaveStatus } from '../../leave.model';

@Component({
  selector: 'absence-management-leave-form',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, RouterModule, NgIf, TitleCasePipe],
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.scss'],
})
export class LeaveFormComponent implements OnInit {
  @Input({ required: true }) kind!: 'create' | 'edit';
  @Input() leave: LeaveItem | null = null;
  @Output() leaveSubmitted = new EventEmitter();

  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    reason: ['', [Validators.required]],
    leaveDate: ['', [Validators.required]],
  });
  leaveStatuses = LeaveStatus;
  formTitle?: string;

  ngOnInit() {
    if (this.leave) this.form.patchValue(this.leave);
    this.formTitle = this.kind === 'create' ? 'New Leave' : 'Edit Leave';
  }

  submit() {
    const form = this.form.getRawValue();
    this.leaveSubmitted.emit(form);
  }
}
```

พร้อมกันนี้ให้ทำการสร้าง `LeaveStatus` ในไฟล์ `leave.model.ts`

```typescript
export type LeaveItem = {
  id: number;
  reason: string;
} & ({ status: 'PENDING' | 'ACCEPTED'; rejectedReason?: never } | { status: 'REJECTED'; rejectedReason: string });

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}
```

ลำดับถัดมาให้เขียนส่วนแสดงผลของฟอร์มในไฟล์ `leave-form.component.html`

```html
<form (ngSubmit)="submit()" [formGroup]="form" class="max-w-xl mx-auto w-full flex flex-col my-4 space-y-4">
  <h2 class="text-center mat-headline-5">{{ formTitle }}</h2>
  <mat-form-field>
    <mat-label>Choose a date</mat-label>
    <input matInput [matDatepicker]="picker" formControlName="leaveDate" />
    <mat-hint>MM/DD/YYYY</mat-hint>
    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker></mat-datepicker>
    <mat-error *ngIf="form.get('leaveDate')?.hasError('required')"> Reason is a required filed </mat-error>
  </mat-form-field>
  <mat-form-field>
    <mat-label>Reason</mat-label>
    <textarea matInput formControlName="reason" placeholder="Why do you need to take a vacation?"></textarea>
    <mat-error *ngIf="form.get('reason')?.hasError('required')"> Reason is a required filed </mat-error>
  </mat-form-field>
  <button mat-raised-button color="primary" [disabled]="form.invalid">{{ kind | titlecase }}</button>
</form>
```

เพื่อให้ฟอร์มทั้งหน้าสร้างและหน้าแก้ไขสามารถส่งข้อมูลไปยัง API Server ได้อย่างถูกต้อง เราจะทำการอัพเดทส่วนของ Service ให้มีส่วนของการสร้างและอัพเดท

เปิดไฟล์ `leave.service.ts` พร้อมทั้งอัพเดทข้อมูลต่อไปนี้

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
    return this.http.get<LeaveItem[]>(`${import.meta.env.NG_APP_API_URL}/leaves`);
  }

  getLeaveById(id: number) {
    return this.http.get<LeaveItem>(`${import.meta.env.NG_APP_API_URL}/leaves/${id}`);
  }

  create(form: LeaveForm) {
    return this.http.post<LeaveItem>(`${import.meta.env.NG_APP_API_URL}/leaves/`, form);
  }

  update(id: string, form: LeaveForm) {
    return this.http.patch<LeaveItem>(`${import.meta.env.NG_APP_API_URL}/leaves/${id}`, form);
  }
}
```

ทั้งนี้ให้ทำการอัพเดท `leave.model.ts` เพื่อเพิ่มชนิดข้อมูลของ `LeaveForm` ดังนี้

```typescript
export type LeaveItem = {
  id: number;
  reason: string;
} & ({ status: 'PENDING' | 'ACCEPTED'; rejectedReason?: never } | { status: 'REJECTED'; rejectedReason: string });

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LeaveForm {
  reason: string;
  leaveDate: string;
}
```

**ส่วนแสดงผลการสร้าง Leave ใหม่**

เปิดไฟล์ `create-leave.component.ts` พร้อมใส่ข้อมูลดังนี้

```typescript
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { LeaveForm } from '../../leave.model';
import { LeaveService } from '../../leave.service';
import { LeaveFormComponent } from '../leave-form/leave-form.component';

@Component({
  selector: 'absence-management-create-leave',
  standalone: true,
  imports: [RouterModule, LeaveFormComponent],
  templateUrl: './create-leave.component.html',
  styleUrls: ['./create-leave.component.scss'],
})
export class CreateLeaveComponent {
  private router = inject(Router);
  private leaveService = inject(LeaveService);

  createLeave(leave: LeaveForm) {
    this.leaveService.create(leave).subscribe(() => this.router.navigateByUrl('/leaves'));
  }
}
```

พร้อมกันนี้ให้ทำการอัพเดท `create-leave.component.html` ดังนี้

```html
<absence-management-leave-form kind="create" (leaveSubmitted)="createLeave($event)"></absence-management-leave-form>
```

### ส่วนแสดงผลการอัพเดท Leave

เราจะทำการแสดงผลฟอร์มในหน้า Edit โดยทำการแสดงผลข้อมูล Leave ก่อนหน้าลงฟอร์มก่อน

แก้ไขไฟล์ `edit-leave.component.ts` ดังนี้

```typescript
import { Component, Input, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaveForm, LeaveItem } from '../../leave.model';
import { LeaveService } from '../../leave.service';
import { LeaveFormComponent } from '../leave-form/leave-form.component';

@Component({
  selector: 'absence-management-edit-leave',
  standalone: true,
  imports: [RouterModule, MatProgressSpinnerModule, NgIf, AsyncPipe, LeaveFormComponent],
  templateUrl: './edit-leave.component.html',
  styleUrls: ['./edit-leave.component.scss'],
})
export class EditLeaveComponent {
  private router = inject(Router);
  private leaveService = inject(LeaveService);
  private _id: string | null = null;
  leave$: Observable<LeaveItem> | null = null;
  @Input() set id(value: string) {
    this._id = value;
    this.leave$ = this.leaveService.getLeaveById(+value);
  }

  editLeave(leave: LeaveForm) {
    if (!this._id) return;

    this.leaveService.update(this._id, leave).subscribe(() => this.router.navigateByUrl('/leaves'));
  }
}
```

จากนั้นทำการแสดงผล Form ใน `edit-leave.component.html`

```html
<absence-management-leave-form *ngIf="leave$ | async as leave; else loading" kind="edit" [leave]="leave" (leaveSubmitted)="editLeave($event)"></absence-management-leave-form> <ng-template #loading><mat-spinner></mat-spinner></ng-template>
```

สุดท้ายจึงทำการอัพเดท `app.routes.ts`

```typescript
import { Route } from '@angular/router';
import { LeaveListComponent } from './leaves/components/leave-list/leave-list.component';
import { LeaveDetailsComponent } from './leaves/components/leave-details/leave-details.component';
import { CreateLeaveComponent } from './leaves/components/create-leave/create-leave.component';
import { EditLeaveComponent } from './leaves/components/edit-leave/edit-leave.component';

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
            path: 'new',
            component: CreateLeaveComponent,
          },
          {
            path: ':id',
            component: LeaveDetailsComponent,
          },
          {
            path: ':id/edit',
            component: EditLeaveComponent,
          },
        ],
      },
    ],
  },
];
```

[![edit-leave-form](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/edit-leave-form.png)](https://www.babelcoder.com/tmp/courses/images/enterprise-mean-stack/edit-leave-form.png)

[&lt; Back To Serializers](Serializers.md) | [Next To การเชื่อมต่อฐานข้อมูล MongoDB &gt; ](Connect-Mongodb.md)
