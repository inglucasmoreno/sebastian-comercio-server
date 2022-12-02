import { IsNumber, IsString } from "class-validator";

export class GastosDTO {

  readonly numero: number;

  @IsString()
  readonly fecha_gasto: string;

  @IsString()
  readonly caja: string;

  @IsString()
  readonly tipo_gasto: string;

  readonly observacion: string;
  
  @IsNumber()
  readonly monto: number;

  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}