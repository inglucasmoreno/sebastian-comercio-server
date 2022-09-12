
export class VentaProductosUpdateDTO {

    readonly venta: string;
    
    readonly producto: string;

    readonly familia: string;

    readonly descripcion: string;
    
    readonly unidad_medida: string;
    
    readonly cantidad: number;
    
    readonly precio_unitario: number;
   
    readonly precio_total: number;
    
    readonly activo: boolean;

    readonly creatorUser: string;
    
    readonly updatorUser: string;

}