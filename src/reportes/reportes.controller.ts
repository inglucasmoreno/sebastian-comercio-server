import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ComprasService } from 'src/compras/compras.service';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reportes')
export class ReportesController {

  constructor(private reportesService: ReportesService) {}

  // Reporte en Excel
  // @UseGuards(JwtAuthGuard)
  @Get('/excel/compras')
  async generarExcel(@Res() res) {
    const buffer = await this.reportesService.comprasExcel({});
    
    // res.set({
    //   'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //   // 'Content-Disposition': 'attachment; filename-example.pdf',
    //   'Content-Length': buffer.length
    // })

    // res.set({
    //   'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //   'Content-Disposition': 'attachment; filename="datos.xlsx"',
    //   'Content-Length': buffer.length,
    // });
    // console.log(buffer);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="datos.xlsx"',
      'Content-Length': buffer.length,
    });

    res.send(buffer);

  }


}
