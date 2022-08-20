import { Document } from 'mongoose';

export interface IProductos extends Document {
  readonly codigo: string;
  readonly descripcion: string;
  readonly unidad_medidad: string;
  readonly cantidad: number;
  readonly stock_minimo_alerta: boolean;
  readonly cantidad_minima: number;
  readonly precio: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}