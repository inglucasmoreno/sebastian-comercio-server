
export class OperacionesDTO {
  fecha_operacion:any;
  numero: number;
  readonly total_compras: number;
  readonly total_ventas: number;
  readonly saldo: number;
  readonly total: number;
  observacion: string;
  readonly estado: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}
