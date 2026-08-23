import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';
export type DistanceUnit = 'kilometers' | 'miles';

export interface IPoint {
  lat: number;
  lng: number;
}

export interface ISavedArea {
  id: string;
  name: string;
  polygon: IPoint[];
  createdAt?: Date;
}

export interface IUserSettings {
  unit: DistanceUnit;
  radius: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  settings: IUserSettings;
  savedAreas: ISavedArea[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PointSchema = new Schema<IPoint>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const SavedAreaSchema = new Schema<ISavedArea>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  polygon: { type: [PointSchema], required: true, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const UserSettingsSchema = new Schema<IUserSettings>({
  unit: {
    type: String,
    enum: ['kilometers', 'miles'],
    default: 'kilometers',
  },
  radius: {
    type: Number,
    default: 50,
  },
}, { _id: false });

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
    settings: {
      type: UserSettingsSchema,
      default: { unit: 'kilometers', radius: 50 },
    },
    savedAreas: {
      type: [SavedAreaSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const hashUserPassword = async (user: IUser): Promise<void> => {
  if (!user.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
};

UserSchema.pre('save', async function () {
  await hashUserPassword(this);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export function getUserModel(): Model<IUser> {
  return mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
}

export const User: Model<IUser> = getUserModel();
export default User;
