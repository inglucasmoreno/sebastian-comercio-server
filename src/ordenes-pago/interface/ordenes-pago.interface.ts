import { Document } from 'mongoose';

export interface IOrdenesPago extends Document {
  readonly fecha_pago: string;
  readonly nro: number;
  readonly compra: string;
  readonly proveedor: string;
  readonly pago_total: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}