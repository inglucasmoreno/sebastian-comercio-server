
export class OrdenesPagoCompraUpdateDTO {

  readonly orden_pago: String;

  readonly compra: String;

  readonly compra_cancelada: Boolean;
  
  readonly total_deuda: Number;

  readonly monto_pagado: Number;

  readonly monto_deuda: Number;
  
  readonly activo: Boolean;
  
  readonly creatorUser: String;
  
  readonly updatorUser: String;

}