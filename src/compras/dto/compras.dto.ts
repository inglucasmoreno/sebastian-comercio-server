import { IsBoolean, IsNumber } from "class-validator";

export class ComprasDTO {

  fecha_compra: string;

  readonly nro_factura: string;

  readonly obervacion: string;

  readonly nro: number;
  
  readonly proveedor: string;

  readonly productos: [];

  readonly formas_pago: [];

  readonly cheques: [];

  @IsNumber()
  readonly monto_deuda: number;
  
  @IsNumber()
  readonly monto_pago: number;
  
  @IsNumber()
  readonly precio_total: number;
  
  @IsBoolean()
  readonly cancelada: boolean;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}