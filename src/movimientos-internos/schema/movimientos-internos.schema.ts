import { Schema } from 'mongoose';

export const MovimientosInternosSchema = new Schema({

  nro: {
    type: Number,
    required: true,
    unique: true,
  },

  caja_origen: {
    type: Schema.Types.ObjectId,
    ref: 'cajas',
    required: true,
  },

  caja_destino: {
    type: Schema.Types.ObjectId,
    ref: 'cajas',
    required: true,
  },

  monto_origen: {
    type: Number,
    required: true,
  },

  monto_destino: {
    type: Number,
    required: true,
  },

  observacion: {
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

},{ timestamps: true, collection: 'movimientos_internos' })