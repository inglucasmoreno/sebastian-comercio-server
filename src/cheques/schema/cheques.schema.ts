import { Schema } from 'mongoose';

export const chequesSchema = new Schema({
  
  nro_cheque: {
    type: String,
    required: true,
    uppercase: true,
  },

  emisor: {
    type: String,
    required: true,
    uppercase: true,
  },

  banco: {
    type: Schema.Types.ObjectId,
    ref: 'bancos',
    required: true,
  },

  importe: {
    type: Number,
    required: true
  },

  fecha_cobro: {
    type: Date,
    required: true    
  },

  fecha_salida: {
    type: Date,
    default: new Date()   
  },

  destino: {
    type: String,
    default: ''
  },

  destino_caja: {
    type: String,
    default: ''
  },

  estado: {
    type: String,
    default: 'Creado'
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

},{ timestamps: true, collection: 'cheques' })