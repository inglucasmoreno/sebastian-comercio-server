import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CajasService } from './cajas.service';
import { CajasUpdateDTO } from './dto/cajas-update.dto';
import { CajasDTO } from './dto/cajas.dto';

@Controller('cajas')
export class CajasController {

  constructor( private cajasService: CajasService ){}

  // Cajas por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') cajaID) {
      const caja = await this.cajasService.getId(cajaID);
      res.status(HttpStatus.OK).json({
          message: 'Caja obtenida correctamente',
          caja
      });
  }

  // Listar cajas
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const cajas = await this.cajasService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de cajas correcto',
          cajas
      });
  }

  // Crear caja
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() cajasDTO: CajasDTO ) {
      const caja = await this.cajasService.insert(cajasDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Caja creada correctamente',
          caja
      });
  }
    
  // Actualizar caja
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() cajasUpdateDTO: CajasUpdateDTO, @Param('id') cajaID ) {
      const caja = await this.cajasService.update(cajaID, cajasUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Caja actualizada correctamente',
          caja
      });
  }

}
