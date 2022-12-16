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
  readonly compra: string;
  readonly gasto: string;
  readonly recibo_cobro: string;
  readonly orden_pago: string;
  readonly movimiento_interno: string;
  readonly cheque: string;
  readonly observacion: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}