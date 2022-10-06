import { Document } from 'mongoose';

export interface ICcProveedores extends Document {
  readonly proveedor: string;
  readonly saldo: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}