import { Document } from 'mongoose';

export interface IPresupuestos extends Document {
    readonly cliente: string;
    readonly nro: number;
    readonly descripcion: string;
    readonly tipo_identificacion: string;
    readonly identificacion: string;
    readonly direccion: string;
    readonly telefono: string;
    readonly correo_electronico: string;
    readonly precio_total: number,
    readonly activo: boolean;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly createdAt: Date;
}