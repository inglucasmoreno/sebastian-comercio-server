import { Schema } from 'mongoose';

export const ordenesPagoChequesSchema = new Schema({
  
  orden_pago: {
    type: Schema.Types.ObjectId,
    ref: 'ordenes_pago',
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

},{ timestamps: true, collection: 'ordenes_pago_cheques' })