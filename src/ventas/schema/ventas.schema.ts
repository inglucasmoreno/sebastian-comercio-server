import { Schema } from 'mongoose';

export const ventasSchema = new Schema({
  
  nro: {
    type: Number,
    required: true
  }, 
  
  nro_factura: {
    type: String,
    default: ''
  },

  tipo: {
    type: String,
    default: 'Directa'
  },

  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true,
  },
  
  proveedor: {
    type: Schema.Types.ObjectId,
    ref: 'proveedores',
    required: true
  },

  observacion: {
    type: String,
    default: ''
  },

  precio_total: {
    type: Number,
    required: true
  },

  fecha_venta: {
    type: Date,
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

},{ timestamps: true, collection: 'ventas' })