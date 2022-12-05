import { IsNumber, IsString } from "class-validator";

export class ComprasCajasDTO {

  @IsString()
  readonly compra: string;

  @IsString()
  readonly caja: number;
  
  @IsNumber()
  readonly monto: number;
      
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}