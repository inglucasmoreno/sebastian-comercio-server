import { Document } from 'mongoose';

export interface ICcClientes extends Document {
  readonly cliente: string;
  readonly saldo: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}