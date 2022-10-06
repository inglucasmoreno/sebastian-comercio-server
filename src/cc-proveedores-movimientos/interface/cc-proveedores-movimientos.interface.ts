import { Document } from 'mongoose';

export interface ICcProveedoresMovimientos extends Document {
  readonly tipo: string;
  readonly cc_proveedor: string;
  readonly proveedor: string;
  readonly saldo: number;
  readonly saldo_anterior: number;
  readonly saldo_nuevo: number;
  readonly descripcion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}