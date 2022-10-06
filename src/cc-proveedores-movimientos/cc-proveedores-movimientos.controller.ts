import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CcProveedoresMovimientosService } from './cc-proveedores-movimientos.service';
import { CcProveedoresMovimientosUpdateDTO } from './dto/cc-proveedores-update.dto';
import { CcProveedoresMovimientosDTO } from './dto/cc-proveedores.dto';

@Controller('cc-proveedores-movimientos')
export class CcProveedoresMovimientosController {

  constructor( private movimientosService: CcProveedoresMovimientosService ){}

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
  async insert(@Res() res, @Body() movimientosDTO: CcProveedoresMovimientosDTO ) {
      const movimiento = await this.movimientosService.insert(movimientosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Movimiento creado correctamente',
          movimiento
      });
  }
    
  // Actualizar movimiento
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() movimientosUpdateDTO: CcProveedoresMovimientosUpdateDTO, @Param('id') movimientoID ) {
      const movimiento = await this.movimientosService.update(movimientoID, movimientosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Movimiento actualizado correctamente',
          movimiento
      });
  }


}
