import { Schema } from 'mongoose';

export const comprasSchema = new Schema({
  
  fecha_compra: {
    type: Date,
    required: true,
  },

  nro_factura: {
    type: String,
    required: true
  },

  operacion_nro: {
    type: String,
    default: ''
  }, 

  proveedor: {
    type: Schema.Types.ObjectId,
    ref: 'proveedores',
    required: true,
  },

  formas_pago: {
    type: Array,
    default: []
  },

  observacion: {
    type: String,
    default: ''
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
  
  cancelada: {
    type: Boolean,
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