import { LeaveResponseDto } from '../../dto/leaves/LeaveResponseDto';
import { RequestHandler } from 'express';
import * as service from '../../service/admin/leaves';
import * as authenticator from '../../middleware/authenticator';
import authorizer from '../../middleware/authorizer';
import Role from '../../models/role';

export const findOne: RequestHandler[] = [
  authenticator.accessToken,
  authorizer([Role.ADMIN, Role.MANAGER]),
  async (req, res) => {
    const leave = await service.findOne(req.params.id);

    res.json(new LeaveResponseDto(leave));
  },
];

export const findAll: RequestHandler[] = [
  authenticator.accessToken,
  authorizer([Role.ADMIN, Role.MANAGER]),
  async (_req, res) => {
    const leaves = await service.findAll();

    res.json(leaves.map((l) => new LeaveResponseDto(l)));
  },
];

export const approve: RequestHandler[] = [
  authenticator.accessToken,
  authorizer([Role.ADMIN]),
  async (req, res) => {
    const leave = await service.approve(req.params.id, req.userFromToken.id);

    res.json(new LeaveResponseDto(leave));
  },
];

export const reject: RequestHandler[] = [
  authenticator.accessToken,
  authorizer([Role.ADMIN]),
  async (req, res) => {
    const leave = await service.reject(req.params.id, req.userFromToken.id);

    res.json(new LeaveResponseDto(leave));
  },
];
