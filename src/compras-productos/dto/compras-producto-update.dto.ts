
export class ComprasProductosUpdateDTO {

  readonly compra: string;

  readonly producto: number;
  
  readonly cantidad: number;
  
  readonly precio_unitario: number;
  
  readonly precio_total: number;
  
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}