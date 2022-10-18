import { Schema } from 'mongoose';

export const ventasPropiasSchema = new Schema({
  
  nro: {
    type: Number,
    required: true
  }, 

  tipo: {
    type: String,
    default: 'Propia'
  },

  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true,
  },

  formas_pago: {
    type: Array,
    required: true,
  },

  precio_total: {
    type: Number,
    required: true
  },

  deuda_monto: {
    type: Number,
    required: true
  },

  observacion: {
    type: String,
    default: ''
  },

  cancelada: {
    type: Boolean,
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

},{ timestamps: true, collection: 'ventas_propias' })