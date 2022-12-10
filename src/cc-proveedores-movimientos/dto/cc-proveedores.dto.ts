import { IsNumber, IsString } from "class-validator";

export class CcProveedoresMovimientosDTO {

  @IsString()
  readonly tipo: string;

  @IsString()
  readonly cc_proveedor: string;

  @IsString()
  readonly proveedor: string;

  @IsNumber()
  readonly monto: number;

  readonly saldo_anterior: number;
  
  readonly saldo_nuevo: number;
 
  @IsString()
  readonly descripcion: string;

  readonly compra: string;

  readonly orden_pago: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}