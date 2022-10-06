import { IsNumber, IsString } from "class-validator";

export class CcProveedoresDTO {

  @IsString()
  readonly proveedor: string;

  @IsNumber()
  readonly saldo: number;

  readonly activo: boolean;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;

}