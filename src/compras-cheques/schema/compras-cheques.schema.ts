import { Schema } from 'mongoose';

export const comprasChequesSchema = new Schema({
  
  compra: {
    type: Schema.Types.ObjectId,
    ref: 'compras',
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

},{ timestamps: true, collection: 'compras_cheques' })