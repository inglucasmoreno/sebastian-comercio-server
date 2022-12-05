import { IsNumber, IsString } from "class-validator";

export class OrdenesPagoCajasDTO {

  @IsString()
  readonly orden_pago: string;

  @IsString()
  readonly caja: number;
  
  @IsNumber()
  readonly monto: number;
      
  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}