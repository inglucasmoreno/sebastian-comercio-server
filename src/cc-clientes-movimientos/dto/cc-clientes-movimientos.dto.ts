import { IsNumber, IsString } from "class-validator";

export class CcClientesMovimientosDTO {

  @IsString()
  readonly tipo: string;

  @IsString()
  readonly cc_cliente: string;

  @IsString()
  readonly cliente: string;

  @IsNumber()
  readonly saldo: number;

  @IsNumber()
  readonly saldo_anterior: number;
  
  @IsNumber()
  readonly saldo_nuevo: number;
 
  @IsString()
  readonly descripcion: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}