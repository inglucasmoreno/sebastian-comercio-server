export class MovimientosUpdateDTO {
  readonly tipo_movimiento: string;
  readonly concepto: string;
  readonly tipo_origen: string;
  readonly origen: string;
  readonly origen_descripcion: string;
  readonly origen_monto_anterior: number;
  readonly origen_monto_nuevo: number;
  readonly tipo_destino: string;
  readonly destino: string;
  readonly destino_descripcion: string;
  readonly destino_monto_anterior: number;
  readonly destino_monto_nuevo: number;
  readonly monto: number;
  readonly activo: boolean;
  readonly creatorUser: string;
  readonly updatorUser: string;
}