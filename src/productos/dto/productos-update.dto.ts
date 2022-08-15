
export class ProductosUpdateDTO {

  readonly codigo: string;

  readonly descripcion: string;

  readonly unidad_medida: string;
  
  readonly precio: number;

  readonly moneda: string;

  readonly activo: boolean;

  readonly creatorUser: string;

  readonly updatorUser: string;

}