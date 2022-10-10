import { Document } from 'mongoose';

export interface IVentasPropiasProductos extends Document {
  readonly venta: string;
  readonly producto: string;
  readonly descripcion: string;
  readonly familia: string;
  readonly unidad_medida: string;
  readonly cantidad: number;
  readonly precio_unitario: number;
  readonly precio_total: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}