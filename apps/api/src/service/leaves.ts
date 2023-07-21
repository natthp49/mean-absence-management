import { FilterOutFunctionKeys } from '@typegoose/typegoose/lib/types';
import { LeaveSchema } from '../models/leave';
import { Leave } from '../models';
import LeaveStatus from '../models/leave-status';

export const findAll = (userId: string) => {
  return Leave.find({ user: userId })
    .populate('user')
    .sort({ createdAt: 'desc' });
};

export const findOne = (id: string) => {
  return Leave.findById(id).populate('user');
};

export const create = async (
  userId: string,
  leave: Pick<FilterOutFunctionKeys<LeaveSchema>, 'leaveDate' | 'reason'>
) => {
  const data = await Leave.create({
    ...leave,
    user: userId,
  });

  return data.populate('user');
};

export const update = async (
  id: string,
  leave: Partial<
    Pick<FilterOutFunctionKeys<LeaveSchema>, 'leaveDate' | 'reason'>
  >
) => {
  await Leave.findByIdAndUpdate(id, leave);

  return await findOne(id);
};

export const destroy = async (id: string) => {
  const leave = await findOne(id);

  if (leave.status !== LeaveStatus.PENDING) return;
  return Leave.deleteOne({ _id: id });
};
