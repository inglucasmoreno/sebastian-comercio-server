import { Document } from 'mongoose';

export interface IComprasCajas extends Document {
  readonly compra: string;
  readonly caja: string;
  readonly monto: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}