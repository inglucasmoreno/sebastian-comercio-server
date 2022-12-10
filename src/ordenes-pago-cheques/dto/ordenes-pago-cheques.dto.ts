import { IsArray, IsString } from "class-validator";

export class OrdenesPagoChequesDTO {

  @IsString()
  readonly orden_pago: String;

  @IsString()
  readonly cheque: String;

  readonly activo: Boolean;

  @IsArray()
  readonly creatorUser: String;

  @IsArray()
  readonly updatorUser: String;

}