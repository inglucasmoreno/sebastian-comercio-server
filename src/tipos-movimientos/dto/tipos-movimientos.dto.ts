import { IsString } from "class-validator";

export class TiposMovimientosDTO {

  @IsString()
  readonly descripcion: string;
  
  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}