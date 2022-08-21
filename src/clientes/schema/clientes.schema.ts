import { Schema } from 'mongoose';

export const clientesSchema = new Schema({
  
  descripcion: {
    type: String,
    required: true,
    uppercase: true,
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

  direccion: {
    type: String,
    uppercase: true,
  },

  correo_electronico: {
    type: String,
    uppercase: true,
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