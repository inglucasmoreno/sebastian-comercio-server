import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProductosDTO {

  readonly codigo: string;

  @IsString()
  readonly descripcion: string;

  @IsString()
  readonly unidad_medida: string;
  
  @IsNumber()
  readonly precio: number;

  @IsString()
  readonly moneda: string;

  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}