import { IsNumber, IsString } from "class-validator";

export class VentaProductosDTO {

    @IsString()
    readonly venta: string;
    
    @IsString()
    readonly producto: string;

    @IsString()
    readonly familia: string;

    @IsString()
    readonly descripcion: string;
    
    @IsString()
    readonly unidad_medida: string;
    
    @IsNumber()
    readonly cantidad: number;
    
    @IsNumber()
    readonly precio_unitario: number;
   
    @IsNumber()
    readonly precio_total: number;
    
    readonly activo: boolean;

    @IsString()
    readonly creatorUser: string;
    
    @IsString()
    readonly updatorUser: string;


}