import { Schema } from 'mongoose';

export const ordenesPagoSchema = new Schema({
  
  fecha_pago: {
    type: Date,
    required: true,
  },

  nro: {
    type: Number,
    required: true,
  },

  formas_pago: {
    type: Array,
    ref: 'formas_pago',
    required: true,
  },

  proveedor: {
    type: Schema.Types.ObjectId,
    ref: 'proveedores',
    required: true,
  },

  pago_total: {
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

},{ timestamps: true, collection: 'ordenes_pago' })