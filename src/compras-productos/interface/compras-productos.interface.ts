import { Document } from 'mongoose';

export interface IComprasProductos extends Document {
  readonly compra: string;
  readonly producto: string;
  readonly cantidad: number;
  readonly precio_unitario: number;
  readonly precio_total: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}