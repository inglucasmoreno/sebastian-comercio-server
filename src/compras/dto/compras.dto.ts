import { IsNumber, IsString } from "class-validator";

export class ComprasDTO {

  readonly fecha_compra: string;

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
  
  @IsString()
  readonly estado: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}