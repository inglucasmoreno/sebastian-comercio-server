import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MovimientosInternosUpdateDTO } from './dto/movimientos-internos-update.dto';
import { MovimientosInternosDTO } from './dto/movimientos-internos.dto';
import { MovimientosInternosService } from './movimientos-internos.service';

@Controller('movimientos-internos')
export class MovimientosInternosController {

  constructor( private movimientosInternosService: MovimientosInternosService ){}

  // Movimiento interno por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') movimientoID) {
      const movimiento = await this.movimientosInternosService.getId(movimientoID);
      res.status(HttpStatus.OK).json({
          message: 'Movimiento obtenido correctamente',
          movimiento
      });
  }

  // Listar movimientos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const {movimientos, totalItems} = await this.movimientosInternosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de movimientos correcto',
          movimientos,
          totalItems
      });
  }

  // Crear movimiento
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() movimientoInternoDTO: MovimientosInternosDTO ) {
      const movimiento = await this.movimientosInternosService.insert(movimientoInternoDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Movimiento creado correctamente',
          movimiento
      });
  }
    
  // Actualizar movimiento
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() movimientosInternosUpdateDTO: MovimientosInternosUpdateDTO, @Param('id') movimientoID ) {
      const movimiento = await this.movimientosInternosService.update(movimientoID, movimientosInternosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Movimiento actualizado correctamente',
          movimiento
      });
  }

}
