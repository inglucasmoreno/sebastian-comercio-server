import { Document } from 'mongoose';

export interface IOrdenesPago extends Document {
  readonly fecha_pago: any;
  readonly nro: number;
  readonly compra: string;
  readonly formas_pago: Array<any>;
  readonly proveedor: string;
  readonly pago_total: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly createdAt: any;
}