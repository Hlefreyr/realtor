import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPoint } from './User';
import { IPropertyListing, PropertyListingSchema } from './PropertyData';

export interface IAreas extends Document {
  id: string;
  userId: string;
  name: string;
  polygon: IPoint[];
  properties: IPropertyListing[];
  candidateProperties: IPropertyListing[];
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema<IPoint>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const AreasSchema: Schema<IAreas> = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    polygon: { type: [PointSchema], default: [] },
    properties: { type: [PropertyListingSchema], default: [] },
    candidateProperties: { type: [PropertyListingSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export function getAreasModel(): Model<IAreas> {
  return mongoose.models.Areas || mongoose.model<IAreas>('Areas', AreasSchema);
}

export const Areas: Model<IAreas> = getAreasModel();
export default Areas;
