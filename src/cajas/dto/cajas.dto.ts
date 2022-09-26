import { IsNumber, IsString } from "class-validator";

export class CajasDTO {

  @IsString()
  readonly descripcion: string;

  @IsNumber()
  readonly saldo: number;
  
  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}