import { Document } from 'mongoose';

export interface IVentasPropias extends Document {
  readonly nro: number;
  readonly tipo: string;
  readonly cliente: string;
  readonly precio_total: number;
  readonly observacion: string;
  readonly recibo_cobro: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}