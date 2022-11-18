import { Document } from 'mongoose';

export interface IVentas extends Document {
  readonly nro: number;
  readonly nroFactura: number;
  readonly tipo: string;
  readonly cliente: string;
  readonly proveedor: string;
  readonly precio_total: number;
  readonly observacion: string;
  readonly fecha_venta: Date;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}