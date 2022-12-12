
export class ChequesUpdateDTO {

  readonly nro_cheque: string;

  readonly emisor: string;

  readonly banco: string;

  readonly caja: string;

  readonly importe: number;

  readonly fecha_cobro: Date;
  
  readonly fecha_salida: Date;

  readonly destino: string;

  readonly destino_caja: string;

  readonly estado: string;

  readonly activo: boolean;
  
  readonly creatorUser: string;
  
  readonly updatorUser: string;

}