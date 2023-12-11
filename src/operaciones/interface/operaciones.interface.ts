import { Document } from 'mongoose';

export interface IOperaciones extends Document {
  fecha_operacion: string;
  readonly numero: number;
  readonly total_compras: number;
  readonly total_ventas: number;
  readonly saldo: number;
  readonly total: number;
  readonly estado: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}