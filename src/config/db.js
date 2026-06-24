// src/config/db.js (copied from root config/db.js)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.isMockDB = false;
  } catch (error) {
    console.warn(`\n[DATABASE WARNING] connection refused at ${process.env.MONGODB_URI}`);
    console.warn(`[DATABASE WARNING] Falling back to IN-MEMORY MOCK DATABASE mode.`);
    console.warn(`[DATABASE WARNING] Start MongoDB or configure MONGODB_URI in .env to connect to a real database.\n`);
    global.isMockDB = true;
  }
};

export default connectDB;
