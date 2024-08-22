// models/itemModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  account_number: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  identity_number: {
    type: String,
    required: true,
    unique: true,
  },
}, {versionKey: false});

userSchema.index({ account_number: 1, identity_number: 1 });

const User = mongoose.model('User', userSchema);

export default User;