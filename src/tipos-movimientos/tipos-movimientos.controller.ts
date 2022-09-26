import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TiposMovimientosUpdateDTO } from './dto/tipos-movimientos-update.dto';
import { TiposMovimientosDTO } from './dto/tipos-movimientos.dto';
import { TiposMovimientosService } from './tipos-movimientos.service';

@Controller('tipos-movimientos')
export class TiposMovimientosController {

  constructor( private tiposMovimientosService: TiposMovimientosService ){}

  // Tipo por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') tipoID) {
      const tipo = await this.tiposMovimientosService.getId(tipoID);
      res.status(HttpStatus.OK).json({
          message: 'Tipo obtenido correctamente',
          tipo
      });
  }

  // Listar tipos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const tipos = await this.tiposMovimientosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de tipos correcto',
          tipos
      });
  }

  // Crear tipo
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() tiposMovimientosDTO: TiposMovimientosDTO ) {
      const tipo = await this.tiposMovimientosService.insert(tiposMovimientosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Tipo creado correctamente',
          tipo
      });
  }
    
  // Actualizar tipo
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() tiposMovimientosUpdateDTO: TiposMovimientosUpdateDTO, @Param('id') tipoID ) {
      const tipo = await this.tiposMovimientosService.update(tipoID, tiposMovimientosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Tipo actualizado correctamente',
          tipo
      });
  }

}
