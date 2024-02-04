import { Schema } from 'mongoose';

export const recibosCobroSchema = new Schema({

  nro: {
    type: Number,
    required: true
  },

  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true,
  },

  formas_pago: {
    type: Array,
    required: true
  },

  cobro_total: {
    type: Number,
    required: true
  },

  fecha_cobro: {
    type: Date,
    required: true
  },

  observacion: {
    uppercase: true,
    type: String,
    default: ''
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