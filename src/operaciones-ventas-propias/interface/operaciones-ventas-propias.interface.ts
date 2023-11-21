import { Document } from 'mongoose';

export interface IOperacionesVentasPropias extends Document {
  readonly ventaPropia: string;
  readonly operacion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}