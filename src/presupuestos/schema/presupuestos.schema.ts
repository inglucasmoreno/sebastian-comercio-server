import { Schema } from 'mongoose';

export const presupuestosSchema = new Schema({
  
  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true,
  },

  nro: {
    type: Number,
    required: true
  },
    
  descripcion: {
    type: String,
    required: true,
    uppercase: true
  },

  tipo_identificacion: {
    type: String,
    default: ''
  },

  identificacion: {
    type: String,
    uppercase: true,
    default: '',
  },

  direccion: {
    type: String,
    uppercase: true,
    default: '',
  },

  telefono: {
    type: String,
    uppercase: true,
    default: ''
  },

  correo_electronico: {
    type: String,
    lowercase: true,
    default: ''
  },

  condicion_iva: {
    type: String,
    required: true
  },

  observaciones: {
    type: String,
    default: ''
  },

  precio_total: {
    type: Number,
    required: true
  },

  despacha: {
    type: Schema.Types.ObjectId,
    ref: 'proveedores',
    default: '000000000000000000000000'
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

},{ timestamps: true, collection: 'presupuestos' })