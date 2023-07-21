import mongoose from 'mongoose';
import { config } from './manager';

export const connect = async () => {
  try {
    await mongoose.connect(config.databaseUrl);
  } catch (e) {
    console.error(`cannot connect to the database: ${(e as Error).message}`);
    process.exit(1);
  }
};
