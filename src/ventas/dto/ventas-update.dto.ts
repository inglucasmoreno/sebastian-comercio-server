
export class VentasUpdateDTO {

    readonly nro: number;

    readonly nro_factura: string;

    readonly tipo: string;

    readonly cliente: string;    

    readonly proveedor: string;

    readonly observacion: string;
        
    readonly precio_total: number;
    
    readonly activo: boolean;

    readonly creatorUser: string;

    readonly updatorUser: string;

}