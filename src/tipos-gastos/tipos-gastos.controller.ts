import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TiposGastosUpdateDTO } from './dto/tipos-gastos-update.dto';
import { TiposGastosDTO } from './dto/tipos-gastos.dto';
import { TiposGastosService } from './tipos-gastos.service';

@Controller('tipos-gastos')
export class TiposGastosController {
  constructor(private tiposGastosService: TiposGastosService) { }

  // Tipo de gastos por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') tipoID) {
      const tipo = await this.tiposGastosService.getId(tipoID);
      res.status(HttpStatus.OK).json({
          message: 'Tipo obtenido correctamente',
          tipo
      });
  }

  // Listar tipos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const tipos = await this.tiposGastosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de tipos correcto',
          tipos
      });
  }

  // Crear tipo
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() tipoDTO: TiposGastosDTO) {
      const tipo = await this.tiposGastosService.insert(tipoDTO);
      res.status(HttpStatus.CREATED).json({
          message: 'Tipo creado correctamente',
          tipo
      });
  }

  // Actualizar tipo
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() tiposGastosUpdateDTO: TiposGastosUpdateDTO, @Param('id') tipoID) {
      const tipo = await this.tiposGastosService.update(tipoID, tiposGastosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Tipo actualizado correctamente',
          tipo
      });
  }
}
