import { Component, inject } from '@angular/core';
import { LeaveForm } from '../../leave.model';
import { LeaveService } from '../../leave.service';
import { Router, RouterModule } from '@angular/router';
import { LeaveFormComponent } from '../leave-form/leave-form.component';

@Component({
  selector: 'mean-absence-management-create-leave',
  standalone: true,
  imports: [RouterModule, LeaveFormComponent],
  templateUrl: './create-leave.component.html',
  styleUrls: ['./create-leave.component.scss'],
})
export class CreateLeaveComponent {
  private router = inject(Router);
  private leaveService = inject(LeaveService);

  createLeave(leave: LeaveForm) {
    this.leaveService
      .create(leave)
      .subscribe(() => this.router.navigateByUrl('/leaves'));
  }
}
