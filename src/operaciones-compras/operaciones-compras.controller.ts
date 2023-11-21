import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { OperacionesComprasService } from './operaciones-compras.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OperacionesComprasDTO } from './dto/operaciones-compras.dto';
import { OperacionesComprasUpdateDTO } from './dto/operaciones-compras-update.dto';

@Controller('operaciones-compras')
export class OperacionesComprasController {

  constructor(private operacionesComprasService: OperacionesComprasService) { }

  // OperacionCompra por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') operacionCompraID) {
    const operacionCompra = await this.operacionesComprasService.getId(operacionCompraID);
    res.status(HttpStatus.OK).json({
      message: 'OperacionCompra obtenida correctamente',
      operacionCompra
    });
  }

  // Listar OperacionesCompras
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const operacionesCompras = await this.operacionesComprasService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de OperacionesCompras correcto',
      operacionesCompras
    });
  }

  // Crear OperacionCompra
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() operacionCompraDTO: OperacionesComprasDTO) {
    const operacionCompra = await this.operacionesComprasService.insert(operacionCompraDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'OperacionCompra creada correctamente',
      operacionCompra
    });
  }

  // Actualizar OperacionCompra
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() operacionesComprasUpdateDTO: OperacionesComprasUpdateDTO, @Param('id') operacionCompraID) {
    const operacionCompra = await this.operacionesComprasService.update(operacionCompraID, operacionesComprasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'OperacionCompra actualizada correctamente',
      operacionCompra
    });
  }

  // Eliminar OperacionCompra
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Res() res, @Param('id') operacionCompraID) {
    const operacionCompra = await this.operacionesComprasService.delete(operacionCompraID);
    res.status(HttpStatus.OK).json({
      message: 'OperacionCompra eliminada correctamente',
      operacionCompra
    });
  }

}
