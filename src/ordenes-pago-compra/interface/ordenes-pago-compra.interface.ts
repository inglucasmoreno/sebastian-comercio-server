import { Document } from 'mongoose';

export interface IOrdenesPagoCompra extends Document {
  readonly orden_pago: String;
  readonly compra: String;
  readonly compra_cancelada: Boolean;
  readonly total_deuda: Number;
  readonly monto_pagado: Number;
  readonly monto_deuda: Number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}