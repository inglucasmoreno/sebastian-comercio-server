import { IsArray, IsNumber, IsString } from "class-validator";

export class RecibosCobroDTO {

  readonly nro: Number;

  @IsString()
  readonly cliente: String;

  @IsArray()
  readonly formas_pago: Array<any>;

  @IsArray()
  readonly carro_pago: Array<any>;

  @IsArray()
  readonly cheques: Array<any>;
  
  @IsNumber()
  readonly cobro_total: Number;
  
  @IsString()
  readonly fecha_cobro: String;

  observacion: String;

  readonly activo: Boolean;
  
  @IsString()
  readonly creatorUser: String;
  
  @IsString()
  readonly updatorUser: String;

}