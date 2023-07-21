import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaveService } from '../../leave.service';
import { HttpClientModule } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Leave, LeaveStatus } from '../../leave.model';

@Component({
  selector: 'mean-absence-management-leave-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule,
    DatePipe,
  ],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
})
export class LeaveListComponent {
  private leaveService = inject(LeaveService);
  leaveList$ = this.leaveService.getLeaveList();

  getStatusClasses(status: LeaveStatus) {
    const baseClasses = 'rounded-full text-white bg-blue-300 py-1 px-2';

    switch (status) {
      case LeaveStatus.APPROVED:
        return `${baseClasses} bg-green-500`;
      case LeaveStatus.PENDING:
        return `${baseClasses} bg-blue-500`;
      case LeaveStatus.REJECTED:
        return `${baseClasses} bg-red-500`;
    }
  }

  isPending(leave: Leave) {
    return leave.status === LeaveStatus.PENDING;
  }

  remove(id: string) {
    this.leaveService.remove(id).subscribe(() => {
      this.leaveList$ = this.leaveService.getLeaveList();
    });
  }
}
