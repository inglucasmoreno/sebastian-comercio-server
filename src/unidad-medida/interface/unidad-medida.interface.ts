import { Document } from 'mongoose';

export interface IUnidadMedida extends Document {
  readonly descripcion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}