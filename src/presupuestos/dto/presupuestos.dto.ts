import { IsNumber, IsString } from "class-validator";

export class PresupuestosDTO {

    readonly cliente: string;

    readonly productos: [];
    
    readonly nro: number;
    
    readonly descripcion: string;

    readonly observacion: string;
    
    readonly tipo_identificacion: string;

    readonly identificacion: string;

    readonly direccion: string;

    readonly telefono: string;

    readonly correo_electronico: string;
    
    @IsNumber()
    readonly precio_total: number;
    
    readonly despacha: string;

    readonly condicion_iva: string;

    readonly observaciones: string;

    readonly activo: boolean;

    readonly creatorUser: string;

    readonly updatorUser: string;

}