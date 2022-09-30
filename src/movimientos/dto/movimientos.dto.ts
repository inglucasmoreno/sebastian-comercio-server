import { IsNumber, IsString } from "class-validator";

export class MovimientosDTO {

  @IsString()
  readonly tipo_movimiento: string;
  
  readonly observacion: string;
  readonly tipo_origen: string;
  readonly origen: string;
  readonly origen_descripcion: string;
  readonly origen_monto_anterior: number;
  readonly origen_monto_nuevo: number;
  
  @IsString()
  readonly tipo_destino: string;

  readonly destino: string;
  readonly destino_descripcion: string;
  readonly destino_monto_anterior: number;
  readonly destino_monto_nuevo: number;
  
  @IsNumber()
  readonly monto: number;
  
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;

}