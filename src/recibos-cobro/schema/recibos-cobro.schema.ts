import { Schema } from 'mongoose';

export const recibosCobroSchema = new Schema({

  nro: {
    type: Number,
    required: true
  },

  formas_pago: {
    type: Array,
    required: true
  },

  cobro_total: {
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

},{ timestamps: true, collection: 'recibos_cobros' })