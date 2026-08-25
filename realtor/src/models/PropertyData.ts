import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPropertyListing {
  zpid: string;
  property_id?: string;
  price: number;
  currency?: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  homeType?: string;
  homeStatus?: string;
  imgSrc?: string;
  detailUrl?: string;
  daysOnZillow?: number;
  zestimate?: number;
  rentZestimate?: number;
}

export interface IPropertyData extends Document {
  id: string;
  properties: IPropertyListing[];
  createdAt: Date;
}

export const PropertyListingSchema = new Schema<IPropertyListing>(
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

const PropertyDataSchema: Schema<IPropertyData> = new Schema(
  {
    id: { type: String, required: true, unique: true, default: 'sample-data-1' },
    properties: { type: [PropertyListingSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export function getPropertyDataModel(): Model<IPropertyData> {
  return mongoose.models.PropertyData || mongoose.model<IPropertyData>('PropertyData', PropertyDataSchema);
}

export const PropertyData: Model<IPropertyData> = getPropertyDataModel();
export default PropertyData;
