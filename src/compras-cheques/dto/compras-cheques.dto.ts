import { IsArray, IsString } from "class-validator";

export class ComprasChequesDTO {

  @IsString()
  readonly compra: String;

  @IsString()
  readonly cheque: String;

  readonly activo: Boolean;

  @IsArray()
  readonly creatorUser: String;

  @IsArray()
  readonly updatorUser: String;

}