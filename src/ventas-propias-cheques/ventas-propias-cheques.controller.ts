import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasPropiasChequesUpdateDTO } from './dto/ventas-propias-cheques-update.dto';
import { VentasPropiasChequesDTO } from './dto/ventas-propias-cheques.dto';
import { VentasPropiasChequesService } from './ventas-propias-cheques.service';

@Controller('ventas-propias-cheques')
export class VentasPropiasChequesController {

  constructor( private relacionesService: VentasPropiasChequesService ){}

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
      const relacion = await this.relacionesService.getId(relacionID);
      res.status(HttpStatus.OK).json({
          message: 'Relacion obtenida correctamente',
          relacion
      });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const relaciones = await this.relacionesService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de relaciones correcto',
          relaciones
      });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() relacionDTO: VentasPropiasChequesDTO ) {
      const relacion = await this.relacionesService.insert(relacionDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Relacion creada correctamente',
          relacion
      });
  }
    
  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() relacionesUpdateDTO: VentasPropiasChequesUpdateDTO, @Param('id') relacionID ) {
      const relacion = await this.relacionesService.update(relacionID, relacionesUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Relacion actualizada correctamente',
          relacion
      });
  }

}
