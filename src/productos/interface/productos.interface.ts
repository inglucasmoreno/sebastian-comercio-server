import { Document } from 'mongoose';

export interface IProductos extends Document {
  readonly codigo: string;
  readonly descripcion: string;
  readonly unidad_medidad: string;
  readonly precio: number;
  readonly moneda: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}