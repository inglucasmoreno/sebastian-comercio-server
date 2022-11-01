import { Document } from 'mongoose';

export interface IRecibosCobroVenta extends Document {
  readonly recibo_cobro: String;
  readonly venta_propia: String;
  readonly venta_cancelada: Boolean;
  readonly monto_cobrado: Number;
  readonly monto_deuda: Number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}