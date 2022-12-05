import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrdenesPagoUpdateDTO } from './dto/ordenes-pago-update.dto';
import { OrdenesPagoDTO } from './dto/ordenes-pago.dto';
import { OrdenesPagoService } from './ordenes-pago.service';

@Controller('ordenes-pago')
export class OrdenesPagoController {

  constructor(private ordenesPagoService: OrdenesPagoService) { }

  // Orden de pago por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') ordenesPagoID) {
    const ordenes_pago = await this.ordenesPagoService.getId(ordenesPagoID);
    res.status(HttpStatus.OK).json({
      message: 'Ordenes de pago obtenida correctamente',
      ordenes_pago
    });
  }

  // Listar ordenes de pago
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const ordenes_pago = await this.ordenesPagoService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de ordenes de pago correcto',
      ordenes_pago
    });
  }

  // Crear orden de pago
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() ordenesPagoDTO: OrdenesPagoDTO) {
    const orden_pago = await this.ordenesPagoService.insert(ordenesPagoDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Ordenes de pago creada correctamente',
      orden_pago
    });
  }

  // Actualizar ordenes de pago
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() ordenesPagoUpdateDTO: OrdenesPagoUpdateDTO, @Param('id') ordenesPagoID) {
    const orden_pago = await this.ordenesPagoService.update(ordenesPagoID, ordenesPagoUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Orden de pago actualizada correctamente',
      orden_pago
    });
  }

}
