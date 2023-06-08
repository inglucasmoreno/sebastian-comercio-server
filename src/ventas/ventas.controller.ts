import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {

  constructor( private ventasService: VentasService ){}

  // Venta por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') ventaID) {
      const venta = await this.ventasService.getId(ventaID);
      res.status(HttpStatus.OK).json({
          message: 'Venta obtenida correctamente',
          venta
      });
  }

  // Listar ventas
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const { ventas, totalItems } = await this.ventasService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de ventas correcto',
          ventas,
          totalItems
      });
  }

  // Crear venta
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() ventasDTO: VentasDTO ) {
      await this.ventasService.insert(ventasDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Venta creada correctamente',
      });
  }
    
  // Actualizar venta
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() ventasUpdateDTO: VentasUpdateDTO, @Param('id') ventaID ) {
      const venta = await this.ventasService.update(ventaID, ventasUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Venta actualizada correctamente',
          venta
      });
  }

  // Generar PDF
  @UseGuards(JwtAuthGuard)
  @Post('/generarPDF')
  async generarPDF(@Res() res, @Body() data: any ) {
      await this.ventasService.generarPDF(data);        
      res.status(HttpStatus.CREATED).json({
          message: 'PDF generado correctamente',
      });
  } 

}
