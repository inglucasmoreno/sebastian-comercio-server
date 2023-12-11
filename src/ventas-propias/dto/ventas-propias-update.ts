
export class VentasPropiasUpdateDTO {

    readonly nro: number;

    readonly tipo_cliente: string;

    readonly operacion: string;

    readonly tipo_venta: string;

    readonly formas_pago: string;

    readonly cheques: [];

    readonly productos: [];

    readonly cliente_descripcion: string;

    readonly cliente_tipo_identificacion: string;

    readonly cliente_identificacion: string;

    readonly cliente_direccion: string;

    readonly cliente_telefono: string;

    readonly cliente_correo_electronico: string;

    readonly cliente_condicion_iva: string;

    readonly cliente: string;    

    readonly observacion: string;
        
    readonly precio_total: number;
    
    readonly pago_monto: number;

    readonly deuda_monto: number;

    readonly cancelada: boolean;

    readonly fecha_venta: string;

    readonly activo: boolean;

    readonly creatorUser: string;

    readonly updatorUser: string;

}