import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasPropiasProductosUpdateDTO } from './dto/ventas-propias-productos-update.dto';
import { VentasPropiasProductosDTO } from './dto/ventas-propias-productos.dto';
import { VentasPropiasProductosService } from './ventas-propias-productos.service';

@Controller('ventas-propias-productos')
export class VentasPropiasProductosController {

  constructor( private productosService: VentasPropiasProductosService ){}

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
  async insert(@Res() res, @Body() productosDTO: VentasPropiasProductosDTO ) {
      const productos = await this.productosService.insert(productosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Producto creado correctamente',
          productos
      });
  }
      
  // Actualizar producto
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() productosUpdateDTO: VentasPropiasProductosUpdateDTO, @Param('id') productoID ) {
      const productos = await this.productosService.update(productoID, productosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Producto actualizado correctamente',
          productos
      });
  }

  // Actualizar productos
  @UseGuards(JwtAuthGuard)
  @Put('/actualizar/productos')
  async updateProductos(@Res() res, @Body() productos: any) {
      await this.productosService.updateProductos(productos);
      res.status(HttpStatus.OK).json({
          message: 'Productos actualizados correctamente',
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
