import { IsString } from "class-validator";

export class ProveedoresDTO {

    @IsString()
    readonly descripcion: string;
    
    readonly tipo_identificacion: string;
   
    readonly identificacion: string;
    
    readonly telefono: string;
    
    readonly direccion: string;
    
    readonly correo_electronico: string;

    @IsString()
    readonly condicion_iva: string;
    
    readonly activo: boolean;

}