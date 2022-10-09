
import { Schema } from 'mongoose';

export const CcProveedoresMovimientosSchema = new Schema({

  tipo: {
    type: String,
    required: true,
  },

  cc_proveedor: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  proveedor: {
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

},{ timestamps: true, collection: 'cc_proveedores_movimientos' })