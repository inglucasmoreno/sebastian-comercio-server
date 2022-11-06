import { Document } from 'mongoose';

export interface IRecibosCobro extends Document {
  readonly nro: Number;
  readonly cliente: String;
  readonly formas_pago: Array<any>;
  readonly cobro_total: Number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}