import { Document } from 'mongoose';

export interface ICheques extends Document {
  readonly nro_cheque: string;
  readonly emisor: string;
  readonly banco: string;
  readonly importe: number;
  readonly fecha_cobro: Date;
  readonly estado: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}