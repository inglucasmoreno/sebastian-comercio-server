import { Document } from 'mongoose';

export interface ICajas extends Document {
  readonly descripcion: string;
  readonly saldo: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}