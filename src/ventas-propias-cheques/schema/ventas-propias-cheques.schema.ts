import { Schema } from 'mongoose';

export const ventasPropiasChequesSchema = new Schema({
  
  venta_propia: {
    type: Schema.Types.ObjectId,
    ref: 'ventas_propias',
    required: true
  },

  cheque: {
    type: Schema.Types.ObjectId,
    ref: 'cheques',
    required: true
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

},{ timestamps: true, collection: 'ventas_propias_cheques' })