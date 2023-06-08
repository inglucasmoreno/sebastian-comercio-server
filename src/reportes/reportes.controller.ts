import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ComprasService } from 'src/compras/compras.service';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reportes')
export class ReportesController {

  constructor(private reportesService: ReportesService) { }

  // Reporte en Excel - Compras
  @UseGuards(JwtAuthGuard)
  @Get('/excel/compras')
  async comprasExcel(@Res() res, @Query() querys) {
    const buffer = await this.reportesService.comprasExcel(querys);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="datos.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  // Reporte en Excel - Ventas directas
  @UseGuards(JwtAuthGuard)
  @Get('/excel/ventas')
  async ventasDirectasExcel(@Res() res, @Query() querys) {
    const buffer = await this.reportesService.ventasExcel(querys);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="datos.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  // Reporte en Excel - Ventas propias
  @UseGuards(JwtAuthGuard)
  @Get('/excel/ventas-propias')
  async ventasPropiasExcel(@Res() res, @Query() querys) {
    const buffer = await this.reportesService.ventasPropiasExcel(querys);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="datos.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  // Reporte en Excel - Recibo de cobro
  @UseGuards(JwtAuthGuard)
  @Get('/excel/recibos-cobro')
  async reciboCobroExcel(@Res() res, @Query() querys) {
    const buffer = await this.reportesService.recibosCobroExcel(querys);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="datos.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  // Reporte en Excel - Ordenes de pago
  @UseGuards(JwtAuthGuard)
  @Get('/excel/ordenes-pago')
  async ordenesPagoExcel(@Res() res, @Query() querys) {
    const buffer = await this.reportesService.ordenesPagoExcel(querys);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="datos.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

}
