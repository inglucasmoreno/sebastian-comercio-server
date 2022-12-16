import { IsString } from "class-validator";

export class MovimientosInternosDTO {

  readonly nro: number;

  @IsString()
  readonly caja_origen: string;
  
  @IsString()
  readonly caja_destino: string;
  
  @IsString()
  readonly monto_origen: number;
  
  @IsString()
  readonly monto_destino: number;
  
  readonly observacion: string;
  
  readonly activo: boolean;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;

}