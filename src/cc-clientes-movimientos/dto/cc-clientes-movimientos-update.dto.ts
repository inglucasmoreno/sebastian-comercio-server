

export class CcClientesMovimientosUpdateDTO {

  readonly tipo: string;

  readonly cc_cliente: string;

  readonly cliente: string;

  readonly saldo: number;

  readonly saldo_anterior: number;
  
  readonly saldo_nuevo: number;
 
  readonly descripcion: string;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}