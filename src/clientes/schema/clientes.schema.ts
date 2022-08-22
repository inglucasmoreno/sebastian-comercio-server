import { Schema } from 'mongoose';

export const clientesSchema = new Schema({
  
  descripcion: {
    type: String,
    required: true,
    uppercase: true,
  },
    
  tipo_identificacion: {
    type: String,
    uppercase: true,
    required: true,
  },

  identificacion: {
    type: String,
    required: true,
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

},{ timestamps: true, collection: 'clientes' })