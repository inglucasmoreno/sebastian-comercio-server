import { Schema } from 'mongoose';

export const comprasSchema = new Schema({
  
  fecha_compra: {
    type: Date,
    required: true,
  },

  nro: {
    type: Number,
    required: true,
  },

  monto_deuda: {
    type: Number,
    required: true,
  },

  monto_pago: {
    type: Number,
    required: true,
  },

  precio_total: {
    type: Number,
    required: true,
  },
  
  estado: {
    type: String,
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

},{ timestamps: true, collection: 'compras' })