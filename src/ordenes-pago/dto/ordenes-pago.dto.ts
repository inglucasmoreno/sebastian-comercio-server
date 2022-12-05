import { IsNumber, IsString } from "class-validator";

export class OrdenesPagoDTO {

  @IsString()
  readonly fecha_pago: string;

  readonly nro: number;
  
  @IsString()
  readonly compra: string;
  
  @IsString()
  readonly proveedor: string;
  
  @IsNumber()
  readonly pago_total: number;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}
