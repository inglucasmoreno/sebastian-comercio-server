import { Schema } from 'mongoose';

export const operacionesVentasPropiasSchema = new Schema({
  
  operacion: {
    type: Schema.Types.ObjectId,
    ref: 'operaciones',
    required: true,
  },

  venta_propia: {
    type: Schema.Types.ObjectId,
    ref: 'ventas_propias',
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

},{ timestamps: true, collection: 'operaciones_ventas_propias' })