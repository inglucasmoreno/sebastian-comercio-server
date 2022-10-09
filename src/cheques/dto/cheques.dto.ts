import { IsNumber, IsString } from "class-validator";

export class ChequesDTO {

  @IsString()
  readonly nro_cheque: string;

  @IsString()
  readonly emisor: string;

  @IsString()
  readonly banco: string;

  @IsNumber()
  readonly importe: number;

  @IsString()
  readonly fecha_cobro: Date;
  
  readonly estado: string;

  readonly activo: boolean;
  
  @IsString()
  readonly creatorUser: string;
  
  @IsString()
  readonly updatorUser: string;

}