import { Document } from 'mongoose';

export interface IGastos extends Document {
  readonly numero: number;
  readonly fecha_gasto: string;
  readonly caja: string;
  readonly tipo_gasto: string;
  readonly observacion: string;
  readonly monto: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}