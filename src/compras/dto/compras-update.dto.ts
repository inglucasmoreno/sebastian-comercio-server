
export class ComprasUpdateDTO {

  readonly fecha_compra: string;

  readonly operacion_nro: string;

  readonly operacion: string;

  readonly nro_factura: string;

  readonly observacion: string;

  readonly proveedor: string;

  readonly nro: number;

  readonly productos: [];

  readonly formas_pago: [];
  
  readonly cheques: [];

  readonly monto_deuda: number;
  
  readonly monto_pago: number;
  
  readonly precio_total: number;
  
  readonly cancelada: boolean;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}