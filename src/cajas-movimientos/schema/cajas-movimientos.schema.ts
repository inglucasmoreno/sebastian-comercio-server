
import { Schema } from 'mongoose';

export const CajasMovimientosSchema = new Schema({

  nro: {
    type: Number,
    required: true,
  },

  tipo: {
    type: String,
    required: true,
  },

  caja: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  monto: {
    type: Number,
    required: true,
  },

  saldo_anterior: {
    type: Number,
    required: true,
  },

  saldo_nuevo: {
    type: Number,
    required: true,
  },

  descripcion: {
    type: String,
    required: true,
    uppercase: true
  },

  venta_propia: {
    type: String,
    default: ''
  },

  gasto: {
    type: String,
    default: ''
  },

  recibo_cobro: {
    type: String,
    default: ''
  },

  cheque: {
    type: String,
    default: ''
  },

  observacion: {
    type: String,
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

},{ timestamps: true, collection: 'cajas_movimientos' })