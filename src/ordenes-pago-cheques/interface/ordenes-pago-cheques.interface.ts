import { Document } from 'mongoose';

export interface IOrdenesPagoCheques extends Document {
  readonly orden_pago: String;
  readonly cheque: String;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}