import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MovimientosUpdateDTO } from './dto/movimientos-update.dto';
import { MovimientosDTO } from './dto/movimientos.dto';
import { MovimientosService } from './movimientos.service';

@Controller('movimientos')
export class MovimientosController {

  constructor( private movimientosService: MovimientosService ){}

  // Inicializacion de seccion
  @UseGuards(JwtAuthGuard)
  @Get('/inicializacion/seccion')
  async init(@Res() res) {
      const data = await this.movimientosService.init();
      res.status(HttpStatus.OK).json({
          message: 'Inicializacion obtenida correctamente',
          data
      });
  }

  // Movimiento por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') movimientoID) {
      const movimiento = await this.movimientosService.getId(movimientoID);
      res.status(HttpStatus.OK).json({
          message: 'Movimiento obtenido correctamente',
          movimiento
      });
  }

  // Listar movimientos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const movimientos = await this.movimientosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de movimientos correcto',
          movimientos
      });
  }

  // Crear movimiento
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() movimientoDTO: MovimientosDTO ) {
      const movimiento = await this.movimientosService.insert(movimientoDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Movimiento creado correctamente',
          movimiento
      });
  }
    
  // Actualizar movimiento
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() movimientosUpdateDTO: MovimientosUpdateDTO, @Param('id') movimientoID ) {
      const movimiento = await this.movimientosService.update(movimientoID, movimientosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Movimiento actualizado correctamente',
          movimiento
      });
  }
 
}
