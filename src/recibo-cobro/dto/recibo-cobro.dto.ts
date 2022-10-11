import { IsArray, IsNumber, IsString } from "class-validator";

export class RecibosCobrosDTO {
  
  @IsArray()
  readonly formas_pago: Array<any>;
  
  @IsArray()
  readonly cheques: Array<any>;
  
  @IsNumber()
  readonly precio_total: Number;
  
  readonly activo: boolean;
  
  @IsArray()
  readonly creatorUser: string;
  
  @IsArray()
  readonly updatorUser: string;

}