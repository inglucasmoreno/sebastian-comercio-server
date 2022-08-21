import { IsString } from "class-validator";

export class PresupuestoProductosDTO {

    @IsString()
    readonly presupuesto: string;
    
    @IsString()
    readonly producto: string;
    
    @IsString()
    readonly descripcion: string;
    
    @IsString()
    readonly unidad_medida: string;
    
    @IsString()
    readonly cantidad: number;
    
    @IsString()
    readonly precio_unitario: number;
   
    @IsString()
    readonly precio_total: number;
    
    readonly activo: boolean;

    @IsString()
    readonly creatorUser: string;
    
    @IsString()
    readonly updatorUser: string;


}