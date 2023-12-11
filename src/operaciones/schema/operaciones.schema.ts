import { Schema } from 'mongoose';

export const operacionesSchema = new Schema({
  
  fecha_operacion: {
    type: Date,
    default: Date.now
  },

  numero: {
    type: Number,
    required: true,
  },

  total_compras: {
    type: Number,
    default: 0,
  },

  total_ventas: {
    type: Number,
    default: 0,
  },

  saldo: {
    type: Number,
    default: 0,
  },

  total: {
    type: Number,
    default: 0,
  },

  estado: {
    type: String,
    required: true,
    enum: ['Abierta', 'Completada'],
    default: 'Abierta'
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

},{ timestamps: true, collection: 'operaciones' })