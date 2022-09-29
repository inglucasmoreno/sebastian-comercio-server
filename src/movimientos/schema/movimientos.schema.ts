import { Schema } from 'mongoose';

export const movimientosSchema = new Schema({
  
  // Tipo de movimiento

  tipo_movimiento: {
    type: Schema.Types.ObjectId,
    ref: 'tipos_movimientos',
    required: true,
  },

  // Varios

  concepto: {
    type: String,
    default: ''
  },

  // Origen
  
  tipo_origen: {
    type: String,
    required: true
  },

  origen: {
    type: Schema.Types.ObjectId,
    required: true
  },

  origen_descripcion: {
    type: String,
    required: true
  },

  origen_monto_anterior: {
    type: Number,
    required: true
  },

  origen_monto_nuevo: {
    type: Number,
    required: true
  },

  // Destino
  
  tipo_destino: {
    type: String,
    required: true
  },

  destino: {
    type: Schema.Types.ObjectId,
    required: true
  },

  destino_descripcion: {
    type: String,
    required: true
  },

  destino_monto_anterior: {
    type: Number,
    required: true
  },

  destino_monto_nuevo: {
    type: Number,
    required: true
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

},{ timestamps: true, collection: 'movimientos' })