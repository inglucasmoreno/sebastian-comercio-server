import { IsString } from "class-validator";

export class OperacionesComprasDTO {

  @IsString()
  readonly compra: string;
  
  @IsString()
  readonly operacion: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}