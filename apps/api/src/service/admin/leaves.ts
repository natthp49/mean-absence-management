import { Leave, LeaveStatus } from '../../models';

export const findAll = () => {
  return Leave.find();
};

export const findOne = (id: string) => {
  return Leave.findById(id);
};

export const approve = (id: string, userId: string) => {
  return Leave.findByIdAndUpdate(
    id,
    {
      status: LeaveStatus.APPROVED,
      approvedById: userId,
    },
    { new: true }
  ).populate('user');
};

export const reject = (id: string, userId: string) => {
  return Leave.findByIdAndUpdate(id, {
    status: LeaveStatus.REJECTED,
    approvedById: userId,
  });
};
