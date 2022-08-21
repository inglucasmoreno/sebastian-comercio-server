export class PresupuestosUpdateDTO {

    readonly cliente: string;
    
    readonly nro: string;
    
    readonly descripcion: string;
    
    readonly tipo_identificacion: string;

    readonly identificacion: string;

    readonly telefono: string;

    readonly correo_electronico: string;

    readonly precio_total: number;

    readonly activo: boolean;

    readonly creatorUser: string;

    readonly updatorUser: string;

}