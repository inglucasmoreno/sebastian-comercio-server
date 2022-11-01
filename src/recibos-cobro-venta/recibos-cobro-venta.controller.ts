import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RecibosCobroVentaUpdateDTO } from './dto/recibos-cobro-venta-update.dto';
import { RecibosCobroVentaDTO } from './dto/recibos-cobro-venta.dto';
import { RecibosCobroVentaService } from './recibos-cobro-venta.service';

@Controller('recibos-cobro-venta')
export class RecibosCobroVentaController {

  constructor( private recibosCobroVentaService: RecibosCobroVentaService ){}

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
      const relacion = await this.recibosCobroVentaService.getId(relacionID);
      res.status(HttpStatus.OK).json({
          message: 'Relacion obtenida correctamente',
          relacion
      });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const relaciones = await this.recibosCobroVentaService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de relaciones correcto',
          relaciones
      });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() relacionDTO: RecibosCobroVentaDTO ) {
      const relacion = await this.recibosCobroVentaService.insert(relacionDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Relacion creada correctamente',
          relacion
      });
  }
    
  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() relacionUpdateDTO: RecibosCobroVentaUpdateDTO, @Param('id') relacionID ) {
      const relacion = await this.recibosCobroVentaService.update(relacionID, relacionUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Relacion actualizada correctamente',
          relacion
      });
  }


}
