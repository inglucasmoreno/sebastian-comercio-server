import { Schema } from 'mongoose';

export const productosSchema = new Schema({

  codigo: {
    type: String,
    uppercase: true,
    unique: true,
    default: ''
  },

  descripcion: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },

  unidad_medida: {
    type: Schema.Types.ObjectId,
    ref: 'unidad_medida',
    required: true
  },

  precio: {
    type: Number,
    required: true
  },

  moneda: {
    type: String,
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

},{ timestamps: true, collection: 'productos' })