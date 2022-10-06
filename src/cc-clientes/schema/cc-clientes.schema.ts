
import { Schema } from 'mongoose';

export const CcClientesSchema = new Schema({

  cliente: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  saldo: {
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

},{ timestamps: true, collection: 'cc_clientes' })