import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BancosService } from './bancos.service';
import { BancosUpdateDTO } from './dto/bancos-update.dto';
import { BancosDTO } from './dto/bancos.dto';

@Controller('bancos')
export class BancosController {

  constructor( private bancosService: BancosService ){}

  // Banco por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') bancoID) {
      const banco = await this.bancosService.getId(bancoID);
      res.status(HttpStatus.OK).json({
          message: 'Banco obtenido correctamente',
          banco
      });
  }

  // Listar bancos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const bancos = await this.bancosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de bancos correcto',
          bancos
      });
  }

  // Crear bancos
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() bancosDTO: BancosDTO ) {
      const banco = await this.bancosService.insert(bancosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Banco creado correctamente',
          banco
      });
  }
    
  // Actualizar banco
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() bancosUpdateDTO: BancosUpdateDTO, @Param('id') bancoID ) {
      const banco = await this.bancosService.update(bancoID, bancosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Banco actualizado correctamente',
          banco
      });
  }

}
