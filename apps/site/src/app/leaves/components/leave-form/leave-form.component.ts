import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { Leave, LeaveStatus } from '../../leave.model';

@Component({
  selector: 'mean-absence-management-leave-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    TitleCasePipe,
  ],
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.scss'],
})
export class LeaveFormComponent implements OnInit {
  @Input({ required: true }) kind!: 'create' | 'edit';
  @Input() leave: Leave | null = null;
  @Output() leaveSubmitted = new EventEmitter();

  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    reason: ['', [Validators.required]],
    leaveDate: ['', [Validators.required]],
  });
  leaveStatuses = LeaveStatus;
  formTitle = this.kind === 'create' ? 'New Leave' : 'Edit Leave';

  ngOnInit() {
    if (this.leave) this.form.patchValue(this.leave);
  }

  submit() {
    const form = this.form.getRawValue();
    this.leaveSubmitted.emit(form);
  }
}
