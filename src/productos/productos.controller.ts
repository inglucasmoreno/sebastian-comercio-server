import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProductosUpdateDTO } from './dto/productos-update.dto';
import { ProductosDTO } from './dto/productos.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {

  constructor( private productosService: ProductosService ){}

  // Productos por ID
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
      const {productos, totalItems, familias, unidades_medida} = await this.productosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de productos correcto',
          productos,
          totalItems,
          familias,
          unidades_medida
      });
  }

  // Crear producto
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() productoDTO: ProductosDTO ) {
      const producto = await this.productosService.insert(productoDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Producto creada correctamente',
          producto
      });
  }
  
  // Actualizar producto
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() productosUpdateDTO: ProductosUpdateDTO, @Param('id') productoID ) {
      
      const producto = await this.productosService.update(productoID, productosUpdateDTO);

      res.status(HttpStatus.OK).json({
          message: 'Producto actualizada correctamente',
          producto
      });

  }

}
