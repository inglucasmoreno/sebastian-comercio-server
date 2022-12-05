import { Schema } from 'mongoose';

export const comprasProductosSchema = new Schema({
  
  compra: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'compras'
  },

  producto: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'productos'
  },

  cantidad: {
    type: Number,
    required: true,
  },

  precio_unitario: {
    type: Number,
    required: true,
  },

  precio_total: {
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

},{ timestamps: true, collection: 'compras_productos' })