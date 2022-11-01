import { IsArray, IsNumber, IsString } from "class-validator";

export class RecibosCobroVentaDTO {

  @IsString()
  readonly recibo_cobro: String;

  @IsString()
  readonly venta_propia: String;

  readonly venta_cancelada: Boolean;
  
  @IsNumber()
  readonly monto_cobrado: Number;

  @IsNumber()
  readonly monto_deuda: Number;
  
  readonly activo: Boolean;
  
  @IsArray()
  readonly creatorUser: String;
  
  @IsArray()
  readonly updatorUser: String;

}