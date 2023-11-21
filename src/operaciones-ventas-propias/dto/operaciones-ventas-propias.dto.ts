import { IsString } from "class-validator";

export class OperacionesVentasPropiasDTO {

  @IsString()
  readonly venta_propia: string;
  
  @IsString()
  readonly operacion: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}