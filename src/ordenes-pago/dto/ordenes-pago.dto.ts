import { IsArray, IsNumber, IsString } from "class-validator";

export class OrdenesPagoDTO {

  @IsString()
  readonly fecha_pago: string;

  readonly nro: number;
  
  @IsArray()
  readonly formas_pago: [];
  
  @IsString()
  readonly proveedor: string;
  
  @IsNumber()
  readonly pago_total: number;
  
  readonly observacion: string;

  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}
