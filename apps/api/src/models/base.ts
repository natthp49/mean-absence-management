import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export interface BaseSchema extends Base {}
export class BaseSchema extends TimeStamps {}
