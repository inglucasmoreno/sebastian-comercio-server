import { Schema } from 'mongoose';

export const recibosCobroVentaSchema = new Schema({
  
  recibo_cobro: {
    type: Schema.Types.ObjectId,
    ref: 'recibos_cobro',
    required: true,
  },

  venta_propia: {
    type: Schema.Types.ObjectId,
    ref: 'ventas_propias',
    required: true,
  },

  venta_cancelada: {
    type: Boolean,
    default: true
  },

  monto_cobrado: {
    type: Number,
    required: true
  },

  monto_deuda: {
    type: Number,
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

},{ timestamps: true, collection: 'recibos_cobro_venta' })