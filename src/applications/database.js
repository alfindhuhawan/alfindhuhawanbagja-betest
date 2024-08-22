import mongoose from 'mongoose';
import getConfig from './config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(getConfig.mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;