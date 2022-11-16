import { IsNumber, IsString } from "class-validator";

export class CajasMovimientosDTO {

  @IsNumber()
  readonly nro: number;

  @IsString()
  readonly tipo: string;

  @IsString()
  readonly caja: string;

  @IsNumber()
  readonly monto: number;

  readonly saldo_anterior: number;
  
  readonly saldo_nuevo: number;
 
  @IsString()
  readonly descripcion: string;

  readonly venta_propia: string;

  readonly recibo_cobro: string;

  readonly cheque: string;

  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}