import { Schema } from 'mongoose';

export const ventasPropiasSchema = new Schema({
  
  nro: {
    type: Number,
    required: true
  }, 

  tipo: {
    type: String,
    default: 'Propia'
  },

  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'clientes',
    required: true,
  },

  precio_total: {
    type: Number,
    required: true
  },

  observacion: {
    type: String,
    default: ''
  },

  recibo_cobro: {
    type: Schema.Types.ObjectId,
    ref: 'recibos_cobros',
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

},{ timestamps: true, collection: 'ventas_propias' })