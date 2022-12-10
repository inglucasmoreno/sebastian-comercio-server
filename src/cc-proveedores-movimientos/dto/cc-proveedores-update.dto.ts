

export class CcProveedoresMovimientosUpdateDTO {

  readonly tipo: string;

  readonly cc_proveedor: string;

  readonly proveedor: string;

  readonly monto: number;

  readonly saldo_anterior: number;
  
  readonly saldo_nuevo: number;
 
  readonly descripcion: string;

  readonly compra: string;

  readonly orden_pago: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}