import { Schema } from 'mongoose';

export const operacionesComprasSchema = new Schema({
  
  operacion: {
    type: Schema.Types.ObjectId,
    ref: 'operaciones',
    required: true,
  },

  compra: {
    type: Schema.Types.ObjectId,
    ref: 'compras',
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

},{ timestamps: true, collection: 'operaciones_compras' })