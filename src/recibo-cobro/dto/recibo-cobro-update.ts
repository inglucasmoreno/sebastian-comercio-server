
export class RecibosCobrosUpdateDTO {

  readonly venta_propia: string;
  
  readonly formas_pago: Array<any>;
  
  readonly cheques: Array<any>;
  
  readonly precio_total: Number;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}