import { Document } from 'mongoose';

export interface IRecibosCobroCheque extends Document {
  readonly recibo_cobro: String;
  readonly cheque: String;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}