import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComprasService } from './compras.service';
import { ComprasUpdateDTO } from './dto/compras-update.dto';
import { ComprasDTO } from './dto/compras.dto';

@Controller('compras')
export class ComprasController {

  constructor(private comprasService: ComprasService) { }

  // Compra por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') compraID) {
    const compra = await this.comprasService.getId(compraID);
    res.status(HttpStatus.OK).json({
      message: 'Compra obtenida correctamente',
      compra
    });
  }

  // Listar compras
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const { compras, totalItems } = await this.comprasService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de compras correcto',
      compras,
      totalItems
    });
  }

  // Crear compra
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() comprasDTO: ComprasDTO) {
    const compra = await this.comprasService.insert(comprasDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Compra creada correctamente',
      compra
    });
  }

  // Actualizar compra
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() comprasUpdateDTO: ComprasUpdateDTO, @Param('id') compraID) {
    const compra = await this.comprasService.update(compraID, comprasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Compra actualizada correctamente',
      compra
    });
  }

  // Alta/Baja de compra
  @UseGuards(JwtAuthGuard)
  @Put('/alta-baja/:id')
  async altaBaja(@Res() res, @Body() data: any, @Param('id') compraID) {
    const compra = await this.comprasService.altaBaja(compraID, data);
    res.status(HttpStatus.OK).json({
      message: 'Compra actualizada correctamente',
      compra
    });
  }

  // Generar PDF
  @UseGuards(JwtAuthGuard)
  @Post('/generarPDF')
  async generarPDF(@Res() res, @Body() data: any) {
    await this.comprasService.generarPDF(data);
    res.status(HttpStatus.CREATED).json({
      message: 'PDF generado correctamente',
    });
  }

  // Reporte en Excel
  // @UseGuards(JwtAuthGuard)
  @Get('/generarExcel/2/2')
  async generarExcel(@Res() res) {
    console.log('Llega');
    const buffer = await this.comprasService.generarExcel({});
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // 'Content-Disposition': 'attachment; filename-example.pdf',
      'Content-Length': buffer.length
    })
    
    res.end(buffer);
    // res.status(HttpStatus.CREATED).json({
    //   message: 'Excel generado correctamente',
    // });
  }


}
