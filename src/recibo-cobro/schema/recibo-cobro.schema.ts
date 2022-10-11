import { Schema } from 'mongoose';

export const recibosCobrosSchema = new Schema({
  
  formas_pago: {
    type: Array,
    required: true
  },

  cheque: {
    type: Array,
    required: true
  },

  precio_total: {
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