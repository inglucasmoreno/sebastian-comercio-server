import { Schema } from 'mongoose';

export const recibosCobroChequeSchema = new Schema({
  
  recibo_cobro: {
    type: Schema.Types.ObjectId,
    ref: 'recibos_cobro',
    required: true,
  },

  cheque: {
    type: Schema.Types.ObjectId,
    ref: 'cheques',
    required: true,
  },

  activo: {
    type: Boolean,
    default: true
  },

  creatorUser: {
    type: Schema.Types.ObjectId,
    ref: 'usuario',
    required: true,
  },

  updatorUser: {
    type: Schema.Types.ObjectId,
    ref: 'usuario',
    required: true,
  }

},{ timestamps: true, collection: 'recibos_cobro_cheque' })