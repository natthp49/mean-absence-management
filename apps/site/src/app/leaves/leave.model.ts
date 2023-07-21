export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LeaveForm {
  reason: string;
  leaveDate: string;
}

export interface Leave {
  id: string;
  status: LeaveStatus;
  reason: string;
  leaveDate: string;
  rejectionReason?: string;
  // user: UserProfile;
  // approvedBy?: UserProfile;
  createdAt: string;
  updatedAt: string;
}
