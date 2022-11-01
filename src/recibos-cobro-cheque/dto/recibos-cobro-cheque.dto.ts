import { IsArray, IsString } from "class-validator";

export class RecibosCobroChequeDTO {

  @IsString()
  readonly recibo_cobro: String;

  @IsString()
  readonly cheque: String;

  readonly activo: Boolean;

  @IsArray()
  readonly creatorUser: String;

  @IsArray()
  readonly updatorUser: String;

}