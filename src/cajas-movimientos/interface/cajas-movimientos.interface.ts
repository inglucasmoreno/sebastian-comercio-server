import { Document } from 'mongoose';

export interface ICajasMovimientos extends Document {
  readonly nro: number;
  readonly tipo: string;
  readonly caja: string;
  readonly monto: number;
  readonly saldo_anterior: number;
  readonly saldo_nuevo: number;
  readonly descripcion: string;
  readonly venta_propia: string;
  readonly recibo_cobro: string;
  readonly cheque: string;
  readonly observacion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}