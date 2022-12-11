import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComprasProductosService } from './compras-productos.service';
import { ComprasProductosUpdateDTO } from './dto/compras-producto-update.dto';
import { ComprasProductosDTO } from './dto/compras-productos.dto';

@Controller('compras-productos')
export class ComprasProductosController {

  constructor(private comprasProductosService: ComprasProductosService) { }

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
    const relacion = await this.comprasProductosService.getId(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion obtenida correctamente',
      relacion
    });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const productos = await this.comprasProductosService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de productos correcto',
      productos
    });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() comprasProductosDTO: ComprasProductosDTO) {
    const relacion = await this.comprasProductosService.insert(comprasProductosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Relacion creada correctamente',
      relacion
    });
  }

  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() comprasProductosUpdateDTO: ComprasProductosUpdateDTO, @Param('id') relacionID) {
    const relacion = await this.comprasProductosService.update(relacionID, comprasProductosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Relacion actualizada correctamente',
      relacion
    });
  }

  // Actualizar relaciones
  @UseGuards(JwtAuthGuard)
  @Put('/actualizar/productos')
  async updateProductos(@Res() res, @Body() productos: any) {
    await this.comprasProductosService.updateRelaciones(productos);
    res.status(HttpStatus.OK).json({
      message: 'Productos actualizados correctamente',
    });
  }

  // Eliminar producto
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Res() res, @Param('id') productoID) {
    const producto = await this.comprasProductosService.delete(productoID);
    res.status(HttpStatus.OK).json({
      message: 'Producto eliminado correctamente',
      producto
    });
  }

}
