import { Document } from 'mongoose';

export interface ICompras extends Document {
  readonly fecha_compra: any;
  readonly operacion: any;
  readonly nro_factura: string;
  readonly proveedor: string;
  readonly formas_pago: [];
  readonly observacion: string;
  readonly nro: number;
  readonly monto_deuda: number;
  readonly monto_pago: number;
  readonly precio_total: number;
  readonly cancelada: boolean;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly createdAt: any;
}