import { ErrorRequestHandler } from 'express';
import { MongooseError } from 'mongoose';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ValidationError } from '../errors/ValidationError';
import { HTTP_STATUSES } from '../helpers/http-statuses';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({ errors: err.errors });
  }

  if (err instanceof MongooseError) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({ errors: err.message });
  }

  if (err instanceof ForbiddenError) {
    res.status(HTTP_STATUSES.FORBIDDEN).json({ errors: err.message });
  }

  if (err instanceof Error && err.name === 'MongoServerError') {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({ errors: err.message });
  }

  next(err);
};

export default errorHandler;
