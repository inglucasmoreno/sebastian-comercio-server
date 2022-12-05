import { Schema } from 'mongoose';

export const ordenesPagoCajasSchema = new Schema({
  
  orden_pago: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'ordenes_pago'
  },

  caja: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'cajas'
  },

  monto: {
    type: Number,
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

},{ timestamps: true, collection: 'ordenes_pago_cajas' })