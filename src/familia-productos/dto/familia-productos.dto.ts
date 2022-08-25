import { IsString } from "class-validator";

export class FamiliaProductosDTO {

  @IsString()
  readonly descripcion: string;
  
  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}