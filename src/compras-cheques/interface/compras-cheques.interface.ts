import { Document } from 'mongoose';

export interface IComprasCheques extends Document {
  readonly compra: String;
  readonly cheque: String;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}