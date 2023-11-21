import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { OperacionesVentasPropiasService } from './operaciones-ventas-propias.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OperacionesVentasPropiasDTO } from './dto/operaciones-ventas-propias.dto';
import { OperacionesVentasPropiasUpdateDTO } from './dto/operaciones-ventas-propias-update.dto';

@Controller('operaciones-ventas-propias')
export class OperacionesVentasPropiasController {

  constructor(private operacionesVentasPropiasService: OperacionesVentasPropiasService) { }

  // OperacionVentaPropia por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') operacionVentaPropiaID) {
    const operacionVentaPropia = await this.operacionesVentasPropiasService.getId(operacionVentaPropiaID);
    res.status(HttpStatus.OK).json({
      message: 'OperacionVentaPropia obtenida correctamente',
      operacionVentaPropia
    });
  }

  // Listar OperacionesVentasPropias
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const operacionesVentasPropias = await this.operacionesVentasPropiasService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de OperacionesVentasPropias correcto',
      operacionesVentasPropias
    });
  }

  // Crear OperacionVentaPropia
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() operacionesVentasPropiasDTO: OperacionesVentasPropiasDTO) {
    const operacionVentaPropia = await this.operacionesVentasPropiasService.insert(operacionesVentasPropiasDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'OperacionVentaPropia creada correctamente',
      operacionVentaPropia
    });
  }

  // Actualizar OperacionOperacionVentaPropia
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() operacionesVentasPropiasUpdateDTO: OperacionesVentasPropiasUpdateDTO, @Param('id') operacionVentaPropiaID) {
    const operacionVentaPropia = await this.operacionesVentasPropiasService.update(operacionVentaPropiaID, operacionesVentasPropiasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'OperacionVentaPropia actualizada correctamente',
      operacionVentaPropia
    });
  }

  // Eliminar OperacionVentaPropia
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Res() res, @Param('id') operacionVentaPropiaID) {
    const operacionVentaPropia = await this.operacionesVentasPropiasService.delete(operacionVentaPropiaID);
    res.status(HttpStatus.OK).json({
      message: 'OperacionVentaPropia eliminada correctamente',
      operacionVentaPropia
    });
  }

}
