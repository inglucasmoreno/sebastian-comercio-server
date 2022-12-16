
export class MovimientosInternosUpdateDTO {

  readonly nro: number;

  readonly caja_origen: string;
  
  readonly caja_destino: string;
  
  readonly monto_origen: number;
  
  readonly monto_destino: number;
  
  readonly observacion: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}