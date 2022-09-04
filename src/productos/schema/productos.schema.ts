import { Schema } from 'mongoose';

export const productosSchema = new Schema({

  familia: {
    type: Schema.Types.ObjectId,
    ref: 'familia_productos',
    required: true,
  },

  codigo: {
    type: String,
    required: true,
    uppercase: true,
    unique: true,
  },

  descripcion: {
    type: String,
    required: true,
    uppercase: true,
  },

  unidad_medida: {
    type: Schema.Types.ObjectId,
    ref: 'unidad_medida',
    required: true
  },

  precio: {
    type: Number,
    default: null
  },

  cantidad: {
    type: Number,
    default: 0
  },

  stock_minimo_alerta: {
    type: Boolean,
    required: true
  },

  cantidad_minima: {
    type: Number,
    default: 0
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

},{ timestamps: true, collection: 'productos' })