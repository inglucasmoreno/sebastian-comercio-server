import { Schema } from 'mongoose';

export const unidadMedidadSchema = new Schema({
  
  descripcion: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
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

},{ timestamps: true, collection: 'unidad_medida' })