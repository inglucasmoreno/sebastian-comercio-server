import { Document } from 'mongoose';

export interface ICheques extends Document {
  readonly nro_cheque: string;
  readonly emisor: string;
  readonly banco: string;
  readonly importe: number;
  readonly fecha_cobro: Date;
  readonly fecha_salida: Date;
  readonly estado: string;
  readonly destino: string;
  readonly destino_caja: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}