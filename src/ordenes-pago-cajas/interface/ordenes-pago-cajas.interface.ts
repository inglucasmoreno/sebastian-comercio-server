import { Document } from 'mongoose';

export interface IOrdenesPagoCajas extends Document {
  readonly orden_pago: string;
  readonly caja: string;
  readonly monto: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}