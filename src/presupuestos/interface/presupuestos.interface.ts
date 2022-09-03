import { Document } from 'mongoose';

export interface IPresupuestos extends Document {
    readonly cliente: string;
    readonly nro: number;
    readonly descripcion: string;
    readonly observacion: string;
    readonly tipo_identificacion: string;
    readonly identificacion: string;
    readonly direccion: string;
    readonly telefono: string;
    readonly correo_electronico: string;
    readonly condicion_iva: string;
    readonly precio_total: number,
    readonly despacha: string,
    readonly observaciones: string;
    readonly activo: boolean;
    readonly creatorUser: string;
    readonly updatorUser: string;
    readonly createdAt: Date;
}