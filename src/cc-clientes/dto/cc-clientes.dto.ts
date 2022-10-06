import { IsNumber, IsString } from "class-validator";

export class CcClientesDTO {

  @IsString()
  readonly cliente: string;

  @IsNumber()
  readonly saldo: number;

  readonly activo: boolean;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;

}