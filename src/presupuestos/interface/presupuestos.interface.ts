import { Document } from 'mongoose';

export interface IClientes extends Document {
    readonly cliente: string;
    readonly nro: string;
    readonly descripcion: string;
    readonly tipo_identificacion: string;
    readonly identificacion: string;
    readonly telefono: string;
    readonly correo_electronico: string;
    readonly activo: boolean;
    readonly creatorUser: string;
    readonly updatorUser: string;
}