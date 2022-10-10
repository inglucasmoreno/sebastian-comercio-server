import { IsString } from "class-validator";

export class VentasPropiasChequesDTO {

  @IsString()
  readonly venta_propia: string;

  @IsString()
  readonly cheque: string;
  
  readonly activo: boolean;

  @IsString()
  readonly creatorUser: string;

  @IsString()
  readonly updatorUser: string;

}