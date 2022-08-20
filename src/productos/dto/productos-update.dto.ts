
export class ProductosUpdateDTO {

  readonly codigo: string;

  readonly descripcion: string;

  readonly unidad_medida: string;
  
  readonly cantidad: number;

  readonly stock_minimo_alerta: boolean;

  readonly cantidad_minima: number;

  readonly precio: number;

  readonly activo: boolean;

  readonly creatorUser: string;

  readonly updatorUser: string;

}