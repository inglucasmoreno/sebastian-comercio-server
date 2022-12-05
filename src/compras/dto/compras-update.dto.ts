
export class ComprasUpdateDTO {

  readonly fecha_compra: string;

  readonly nro: number;
  
  readonly monto_deuda: number;
  
  readonly monto_pago: number;
  
  readonly precio_total: number;
  
  readonly estado: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}