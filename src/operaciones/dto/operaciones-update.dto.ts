
export class OperacionesUpdateDTO {
  fecha_operacion: any;
  readonly numero: number;
  readonly total_compras: number;
  readonly total_ventas: number;
  readonly saldo: number;
  readonly total: number;
  readonly estado: string;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}