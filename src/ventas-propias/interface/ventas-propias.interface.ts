import { Document } from 'mongoose';

export interface IVentasPropias extends Document {
  readonly nro: number;
  readonly tipo: string;
  readonly cliente: string;
  readonly cheques: [];
  readonly formas_pago: [];
  readonly precio_total: number;
  readonly observacion: string;
  readonly pago_monto: number;
  readonly deuda_monto: number;
  readonly cancelada: boolean;
  readonly fecha_venta: Date;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}