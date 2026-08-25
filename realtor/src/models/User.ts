import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IPropertyListing } from './PropertyData';

export type UserRole = 'admin' | 'user';
export type DistanceUnit = 'kilometers' | 'miles';

export interface IPoint {
  lat: number;
  lng: number;
}

export interface ISearchCriteria {
  statusType?: string;
  homeTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bedsMax?: number;
  bathsMin?: number;
  bathsMax?: number;
  sqftMin?: number;
  sqftMax?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  daysOnMarket?: number;
}

export interface ISavedArea {
  id: string;
  name: string;
  polygon: IPoint[];
  properties?: IPropertyListing[];
  candidateProperties?: IPropertyListing[];
  createdAt?: Date;
}

export interface IUserSettings {
  unit: DistanceUnit;
  radius: number;
  searchCriteria?: ISearchCriteria;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  settings: IUserSettings;
  savedAreas: ISavedArea[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PointSchema = new Schema<IPoint>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const PropertyListingSchema = new Schema<IPropertyListing>(
  {
    zpid: { type: String, required: true },
    property_id: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: 'CAD' },
    address: {
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipcode: { type: String, required: true },
      country: { type: String, default: 'CA' },
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    livingArea: { type: Number },
    homeType: { type: String },
    homeStatus: { type: String, default: 'FOR_SALE' },
    imgSrc: { type: String },
    detailUrl: { type: String },
    daysOnZillow: { type: Number },
    zestimate: { type: Number },
    rentZestimate: { type: Number },
  },
  { _id: false }
);

const SavedAreaSchema = new Schema<ISavedArea>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  polygon: { type: [PointSchema], required: true, default: [] },
  properties: { type: [PropertyListingSchema], default: [] },
  candidateProperties: { type: [PropertyListingSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const SearchCriteriaSchema = new Schema<ISearchCriteria>(
  {
    statusType: { type: String, default: 'ForSale' },
    homeTypes: { type: [String], default: ['Houses', 'Condos'] },
    priceMin: { type: Number, default: 0 },
    priceMax: { type: Number, default: 2000000 },
    bedsMin: { type: Number, default: 1 },
    bedsMax: { type: Number, default: 10 },
    bathsMin: { type: Number, default: 1 },
    bathsMax: { type: Number, default: 10 },
    sqftMin: { type: Number, default: 0 },
    sqftMax: { type: Number, default: 10000 },
    yearBuiltMin: { type: Number, default: 1900 },
    yearBuiltMax: { type: Number, default: 2026 },
    daysOnMarket: { type: Number, default: 90 },
  },
  { _id: false }
);

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    unit: {
      type: String,
      enum: ['kilometers', 'miles'],
      default: 'kilometers',
    },
    radius: {
      type: Number,
      default: 50,
    },
    searchCriteria: {
      type: SearchCriteriaSchema,
      default: () => ({
        statusType: 'ForSale',
        homeTypes: ['Houses', 'Condos'],
        priceMin: 0,
        priceMax: 2000000,
        bedsMin: 1,
        bedsMax: 10,
        bathsMin: 1,
        bathsMax: 10,
        sqftMin: 0,
        sqftMax: 10000,
        yearBuiltMin: 1900,
        yearBuiltMax: 2026,
        daysOnMarket: 90,
      }),
    },
  },
  { _id: false }
);

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
      default: () => ({
        unit: 'kilometers',
        radius: 50,
        searchCriteria: {
          statusType: 'ForSale',
          homeTypes: ['Houses', 'Condos'],
          priceMin: 0,
          priceMax: 2000000,
          bedsMin: 1,
          bedsMax: 10,
          bathsMin: 1,
          bathsMax: 10,
          sqftMin: 0,
          sqftMax: 10000,
          yearBuiltMin: 1900,
          yearBuiltMax: 2026,
          daysOnMarket: 90,
        },
      }),
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

export function hashUserPassword(user: IUser): Promise<void> {
  if (!user.isModified('password')) {
    return Promise.resolve();
  }
  return bcrypt.genSalt(10).then((salt) => {
    return bcrypt.hash(user.password, salt).then((hash) => {
      user.password = hash;
    });
  });
}

UserSchema.pre('save', async function () {
  await hashUserPassword(this);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export function getUserModel(): Model<IUser> {
  return mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
}

export const User: Model<IUser> = getUserModel();
export default User;
