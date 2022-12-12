import { IsArray, IsNumber, IsString } from "class-validator";

export class OrdenesPagoCompraDTO {

  @IsString()
  readonly orden_pago: String;

  @IsString()
  readonly compra: String;

  readonly compra_cancelada: Boolean;
  
  @IsNumber()
  readonly total_deuda: Number;

  @IsNumber()
  readonly monto_pagado: Number;

  @IsNumber()
  readonly monto_deuda: Number;
  
  readonly activo: Boolean;
  
  @IsArray()
  readonly creatorUser: String;
  
  @IsArray()
  readonly updatorUser: String;

}