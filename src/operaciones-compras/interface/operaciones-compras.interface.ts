import { Document } from 'mongoose';

export interface IOperacionesCompras extends Document {
  readonly compra: string;
  readonly operacion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}