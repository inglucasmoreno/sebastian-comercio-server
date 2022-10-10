import { Document } from 'mongoose';

export interface IVentasPropiasCheques extends Document {
  readonly venta_propia: string;
  readonly cheque: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}