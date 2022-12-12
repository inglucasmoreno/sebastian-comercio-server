import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrdenesPagoCompraUpdateDTO } from './dto/ordenes-pago-compra-update.dto';
import { OrdenesPagoCompraDTO } from './dto/ordenes-pago-compra.dto';
import { OrdenesPagoCompraService } from './ordenes-pago-compra.service';

@Controller('ordenes-pago-compra')
export class OrdenesPagoCompraController {

  constructor( private ordenesPagoCompraService: OrdenesPagoCompraService ){}

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
      const relacion = await this.ordenesPagoCompraService.getId(relacionID);
      res.status(HttpStatus.OK).json({
          message: 'Relacion obtenida correctamente',
          relacion
      });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const relaciones = await this.ordenesPagoCompraService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de relaciones correcto',
          relaciones
      });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() relacionDTO: OrdenesPagoCompraDTO ) {
      const relacion = await this.ordenesPagoCompraService.insert(relacionDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Relacion creada correctamente',
          relacion
      });
  }
    
  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() relacionUpdateDTO: OrdenesPagoCompraUpdateDTO, @Param('id') relacionID ) {
      const relacion = await this.ordenesPagoCompraService.update(relacionID, relacionUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Relacion actualizada correctamente',
          relacion
      });
  }
  
}
