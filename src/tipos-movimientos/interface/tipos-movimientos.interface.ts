import { Document } from 'mongoose';

export interface ITiposMovimientos extends Document {
  readonly descripcion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}