import { Module } from '@nestjs/common';
import { PresupuestoProductosController } from './presupuesto-productos.controller';
import { PresupuestoProductosService } from './presupuesto-productos.service';

@Module({
  controllers: [PresupuestoProductosController],
  providers: [PresupuestoProductosService]
})
export class PresupuestoProductosModule {}
