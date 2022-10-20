import { Document } from 'mongoose';

export interface ICajasMovimientos extends Document {
  readonly tipo: string;
  readonly caja: string;
  readonly monto: number;
  readonly saldo_anterior: number;
  readonly saldo_nuevo: number;
  readonly descripcion: string;
  readonly venta_propia: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}