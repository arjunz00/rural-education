import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    passwordSalt: {
      type: String,
      default: ''
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ALL_ROLES,
      index: true
    },
    schoolName: {
      type: String,
      default: 'Zilla Parishad High School, Dahiwadi'
    },
    assignedClass: {
      type: String,
      default: null
    },
    isClassTeacher: {
      type: Boolean,
      default: true
    },
    parentContact: {
      type: String,
      default: ''
    },
    institutionalVerificationKey: {
      type: String,
      default: null
    },
    studentId: {
      type: Number,
      required: function () {
        return this.role === ROLES.PARENT || this.role === ROLES.STUDENT;
      },
      index: true,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
};

export const User = mongoose.model('User', userSchema);
