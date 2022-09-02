import { Schema } from 'mongoose';

export const proveedoresSchema = new Schema({
  
  descripcion: {
    type: String,
    required: true,
    uppercase: true,
  },
    
  tipo_identificacion: {
    type: String,
    uppercase: true,
    default: 'DNI'
  },

  identificacion: {
    type: String,
    default: ''
  },

  telefono: {
    type: String,
    default: ''
  },

  direccion: {
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

},{ timestamps: true, collection: 'proveedores' })