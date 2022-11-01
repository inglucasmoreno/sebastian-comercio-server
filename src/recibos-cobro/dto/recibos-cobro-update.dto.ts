
export class RecibosCobroUpdateDTO {

  readonly nro: Number;

  readonly cliente: String;

  readonly formas_pago: Array<any>;
  
  readonly cobro_total: Number;
  
  readonly activo: Boolean;
  
  readonly creatorUser: String;
  
  readonly updatorUser: String;

}