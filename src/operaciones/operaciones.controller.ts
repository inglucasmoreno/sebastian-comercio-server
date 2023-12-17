import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OperacionesDTO } from './dto/operaciones.dto';
import { OperacionesUpdateDTO } from './dto/operaciones-update.dto';

@Controller('operaciones')
export class OperacionesController {

  constructor(private operacionesService: OperacionesService) { }

  // Operacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') operacionID) {
    const { operacion, operacionVentasPropias, operacionCompras } = await this.operacionesService.getId(operacionID);
    res.status(HttpStatus.OK).json({
      message: 'Operacion obtenida correctamente',
      operacion,
      operacionVentasPropias,
      operacionCompras
    });
  }

  // Imprimir - Detalles de operacion
  @UseGuards(JwtAuthGuard)
  @Get('/imprimir-detalles/:id')
  async imprimirDetalles(@Res() res, @Param('id') operacionID) {
    await this.operacionesService.imprimirDetalles(operacionID);
    res.status(HttpStatus.OK).json({
      message: 'Detalles generados correctamente',
    });
  }

  // Listar operaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const operaciones = await this.operacionesService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de operaciones correcto',
      operaciones
    });
  }

  // Crear operacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() operacionesDTO: OperacionesDTO) {
    const operacion = await this.operacionesService.insert(operacionesDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Operacion creada correctamente',
      operacion
    });
  }

  // Actualizar operacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() operacionesUpdateDTO: OperacionesUpdateDTO, @Param('id') operacionID) {
    const operacion = await this.operacionesService.update(operacionID, operacionesUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Operacion actualizada correctamente',
      operacion
    });
  }

  // Completar operacion
  @UseGuards(JwtAuthGuard)
  @Put('/completar/:id')
  async complete(@Res() res, @Param('id') operacionID) {
    const operacion = await this.operacionesService.complete(operacionID);
    res.status(HttpStatus.OK).json({
      message: 'Operacion completada correctamente',
      operacion
    });
  }

}
