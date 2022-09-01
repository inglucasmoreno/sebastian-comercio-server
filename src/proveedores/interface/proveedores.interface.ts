import { Document } from 'mongoose';

export interface IProveedores extends Document {
  readonly _id: string;
  readonly descripcion: string;
  readonly tipo_identificacion: string;
  readonly identificacion: string;
  readonly telefono: string;
  readonly direccion: string;
  readonly correo_electronico: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}