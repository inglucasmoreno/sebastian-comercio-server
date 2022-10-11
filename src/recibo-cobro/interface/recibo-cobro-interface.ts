import { Document } from 'mongoose';

export interface IRecibosCobros extends Document {
  readonly formas_pago: Array<any>;
  readonly cheques: Array<any>;
  readonly precio_total: Number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}