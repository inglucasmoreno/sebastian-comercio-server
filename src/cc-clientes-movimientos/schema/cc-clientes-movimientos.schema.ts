
import { Schema } from 'mongoose';

export const CcClientesMovimientosSchema = new Schema({

  tipo: {
    type: String,
    required: true,
  },

  cc_cliente: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  cliente: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  saldo: {
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

},{ timestamps: true, collection: 'cc_clientes_movimientos' })