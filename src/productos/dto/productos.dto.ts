import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProductosDTO {

  @IsString()
  readonly codigo: string;

  @IsString()
  readonly descripcion: string;

  @IsString()
  readonly unidad_medida: string;
  
  readonly cantidad: number;

  @IsString()
  readonly stock_minimo_alerta: boolean;

  readonly cantidad_minima: number;
  
  @IsNumber()
  readonly precio: number;

  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}