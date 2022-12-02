import { Schema } from 'mongoose';

export const gastosSchema = new Schema({

  numero: {
    type: Number,
    required: true
  },

  fecha_gasto: {
    type: Date,
    required: true
  },

  caja: {
    type: Schema.Types.ObjectId,
    ref: 'cajas',
    required: true,
  },

  tipo_gasto: {
    type: Schema.Types.ObjectId,
    ref: 'tipos_gastos',
    required: true,
  },

  observacion: {
    type: String,
    uppercase: true,
    default: ''
  },

  monto: {
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

},{ timestamps: true, collection: 'gastos' })