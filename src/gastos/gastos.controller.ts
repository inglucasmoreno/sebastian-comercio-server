import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GastosUpdateDTO } from './dto/gastos-update.dto';
import { GastosDTO } from './dto/gastos.dto';
import { GastosService } from './gastos.service';

@Controller('gastos')
export class GastosController {

  constructor(private gastosService: GastosService) { }

  // Gastos por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') gastoID) {
    const gasto = await this.gastosService.getId(gastoID);
    res.status(HttpStatus.OK).json({
      message: 'Gasto obtenido correctamente',
      gasto
    });
  }

  // Listar gastos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const {gastos, totalItems} = await this.gastosService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de gastos correcto',
      gastos,
      totalItems
    });
  }

  // Crear gasto
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() gastosDTO: GastosDTO) {
    const gasto = await this.gastosService.insert(gastosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Gasto creado correctamente',
      gasto
    });
  }

  // Actualizar gasto
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() gastosUpdateDTO: GastosUpdateDTO, @Param('id') gastoID) {
    const gasto = await this.gastosService.update(gastoID, gastosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Gasto actualizado correctamente',
      gasto
    });
  }

  // Alta/Baja de gasto
  @UseGuards(JwtAuthGuard)
  @Put('/alta-baja/:id')
  async altaBaja(@Res() res, @Body() data: any, @Param('id') gastoID) {
    const gasto = await this.gastosService.altaBaja(gastoID, data);
    res.status(HttpStatus.OK).json({
      message: 'Gasto actualizado correctamente',
      gasto
    });
  }

}
