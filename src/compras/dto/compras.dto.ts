import { IsNumber, IsString } from "class-validator";

export class ComprasDTO {

  readonly fecha_compra: string;

  @IsNumber()
  readonly nro: number;
  
  @IsNumber()
  readonly monto_deuda: number;
  
  @IsNumber()
  readonly monto_pago: number;
  
  @IsNumber()
  readonly precio_total: number;
  
  @IsString()
  readonly estado: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}