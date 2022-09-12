import { IsNumber, IsString } from "class-validator";

export class VentasDTO {

    readonly nro: number;

    @IsString()
    readonly nro_factura: string;

    @IsString()
    readonly tipo_cliente: string;

    @IsString()
    readonly tipo_venta: string;

    readonly productos: [];

    readonly cliente_descripcion: string;

    readonly cliente_tipo_identificacion: string;

    readonly cliente_identificacion: string;

    readonly cliente_direccion: string;

    readonly cliente_telefono: string;

    readonly cliente_correo_electronico: string;

    readonly cliente_condicion_iva: string;

    @IsString()
    readonly cliente: string;    

    @IsString()
    readonly proveedor: string;

    readonly observacion: string;
        
    @IsNumber()
    readonly precio_total: number;
    
    readonly activo: boolean;

    readonly creatorUser: string;

    readonly updatorUser: string;

}