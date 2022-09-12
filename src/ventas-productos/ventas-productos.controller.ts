import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentaProductosUpdateDTO } from './dto/ventas-productos-update.dto';
import { VentaProductosDTO } from './dto/ventas-productos.dto';
import { VentasProductosService } from './ventas-productos.service';

@Controller('ventas-productos')
export class VentasProductosController {

  constructor( private productosService: VentasProductosService ){}

  // Producto por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') productoID) {
      const producto = await this.productosService.getId(productoID);
      res.status(HttpStatus.OK).json({
          message: 'Producto obtenido correctamente',
          producto
      });
  }

  // Listar productos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const productos = await this.productosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de productos correcto',
          productos
      });
  }

  // Crear producto
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() productosDTO: VentaProductosDTO ) {
      const productos = await this.productosService.insert(productosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Producto creado correctamente',
          productos
      });
  }
    
  // Actualizar producto
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() productosUpdateDTO: VentaProductosUpdateDTO, @Param('id') productoID ) {
      const productos = await this.productosService.update(productoID, productosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Producto actualizado correctamente',
          productos
      });
  }

  // Eliminar producto
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Res() res, @Param('id') productoID ) {
      const producto = await this.productosService.delete(productoID);
      res.status(HttpStatus.OK).json({
          message: 'Producto eliminado correctamente',
          producto
      });
  }

}
