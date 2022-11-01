
export class RecibosCobroVentaUpdateDTO {

  readonly recibo_cobro: String;

  readonly venta_propia: String;

  readonly venta_cancelada: Boolean;
  
  readonly monto_cobrado: Number;

  readonly monto_deuda: Number;
  
  readonly activo: Boolean;
  
  readonly creatorUser: String;
  
  readonly updatorUser: String;

}