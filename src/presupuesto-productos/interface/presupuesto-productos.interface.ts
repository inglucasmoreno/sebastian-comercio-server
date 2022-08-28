import { Document } from 'mongoose';

export interface IPresupuestoProductos extends Document {
  readonly presupuesto: string;
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