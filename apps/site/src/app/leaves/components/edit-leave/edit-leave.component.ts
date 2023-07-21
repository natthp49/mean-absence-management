import { Component, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeaveFormComponent } from '../leave-form/leave-form.component';
import { Leave, LeaveForm } from '../../leave.model';
import { LeaveService } from '../../leave.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

@Component({
  selector: 'mean-absence-management-edit-leave',
  standalone: true,
  imports: [
    RouterModule,
    MatProgressSpinnerModule,
    NgIf,
    AsyncPipe,
    LeaveFormComponent,
  ],
  templateUrl: './edit-leave.component.html',
  styleUrls: ['./edit-leave.component.scss'],
})
export class EditLeaveComponent {
  private router = inject(Router);
  private leaveService = inject(LeaveService);
  private _id: string | null = null;
  leave$: Observable<Leave> | null = null;
  @Input() set id(value: string) {
    this._id = value;
    this.leave$ = this.leaveService.getLeave(value);
  }

  editLeave(leave: LeaveForm) {
    if (!this._id) return;

    this.leaveService
      .update(this._id, leave)
      .subscribe(() => this.router.navigateByUrl('/leaves'));
  }
}
