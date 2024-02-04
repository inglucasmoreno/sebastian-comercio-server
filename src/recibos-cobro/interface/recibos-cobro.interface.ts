import { Document } from 'mongoose';

export interface IRecibosCobro extends Document {
  readonly nro: Number;
  readonly cliente: String;
  readonly formas_pago: Array<any>;
  readonly cobro_total: Number;
  readonly fecha_cobro: Date;
  readonly observacion: String;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}