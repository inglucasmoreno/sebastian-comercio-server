
export class OrdenesPagoUpdateDTO {

  readonly fecha_pago: string;

  readonly nro: number;
  
  readonly formas_pago: [];
  
  readonly proveedor: string;
  
  readonly pago_total: number;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}
