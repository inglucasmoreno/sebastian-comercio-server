import { IsNumber, IsString } from "class-validator";

export class ComprasProductosDTO {

  @IsString()
  readonly compra: string;

  @IsString()
  readonly producto: number;
  
  @IsNumber()
  readonly cantidad: number;
  
  @IsNumber()
  readonly precio_unitario: number;
  
  @IsNumber()
  readonly precio_total: number;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}