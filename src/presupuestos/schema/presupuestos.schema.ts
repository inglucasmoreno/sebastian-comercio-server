import { Schema } from 'mongoose';

export const presupuestosSchema = new Schema({
  
  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true,
  },

  codigo: {
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
    required: true,
  },

  identificacion: {
    type: String,
    required: true,
    uppercase: true,
  },

  telefono: {
    type: String,
    uppercase: true,
  },

  correo_electronico: {
    type: String,
    uppercase: true,
  },

  precio_total: {
    type: Number,
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

},{ timestamps: true, collection: 'presupuestos' })