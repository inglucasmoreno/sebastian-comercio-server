import { Schema } from 'mongoose';

export const comprasCajasSchema = new Schema({
  
  compra: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'compras'
  },

  caja: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'cajas'
  },

  monto: {
    type: Number,
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

},{ timestamps: true, collection: 'compras_cajas' })