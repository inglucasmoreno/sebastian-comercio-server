
export class OrdenesPagoCajasUpdateDTO {

  readonly orden_pago: string;

  readonly caja: number;
  
  readonly monto: number;
      
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}