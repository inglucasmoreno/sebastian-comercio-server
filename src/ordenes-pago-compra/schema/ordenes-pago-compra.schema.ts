import { Schema } from 'mongoose';

export const ordenesPagoCompraSchema = new Schema({
  
  orden_pago: {
    type: Schema.Types.ObjectId,
    ref: 'ordenes_pago',
    required: true,
  },

  compra: {
    type: Schema.Types.ObjectId,
    ref: 'compras',
    required: true,
  },

  compra_cancelada: {
    type: Boolean,
    default: true
  },

  total_deuda: {
    type: Number,
    required: true
  },

  monto_pagado: {
    type: Number,
    required: true
  },

  monto_deuda: {
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

},{ timestamps: true, collection: 'ordenes_pago_compra' })