import { IsString } from "class-validator";

export class ClientesDTO {

    @IsString()
    readonly descripcion: string;
    
    @IsString()
    readonly tipo_identificacion: string;
   
    @IsString()
    readonly identificacion: string;
    
    readonly telefono: string;
    
    readonly direccion: string;
    
    readonly correo_electronico: string;
    
    readonly activo: boolean;

}