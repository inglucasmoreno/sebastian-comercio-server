import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrdenesPagoCajasUpdateDTO } from './dto/ordenes-pago-cajas-update.dto';
import { OrdenesPagoCajasDTO } from './dto/ordenes-pago-cajas.dto';
import { OrdenesPagoCajasService } from './ordenes-pago-cajas.service';

@Controller('ordenes-pago-cajas')
export class OrdenesPagoCajasController {

  constructor(private ordenesPagoCajasService: OrdenesPagoCajasService) { }

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
    const relacion = await this.ordenesPagoCajasService.getId(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion obtenida correctamente',
      relacion
    });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const relaciones = await this.ordenesPagoCajasService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de relaciones correcto',
      relaciones
    });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() ordenesPagoCajasDTO: OrdenesPagoCajasDTO) {
    const relacion = await this.ordenesPagoCajasService.insert(ordenesPagoCajasDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Relacion creada correctamente',
      relacion
    });
  }

  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() ordenesPagoCajasUpdateDTO: OrdenesPagoCajasUpdateDTO, @Param('id') relacionID) {
    const relacion = await this.ordenesPagoCajasService.update(relacionID, ordenesPagoCajasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Relacion actualizada correctamente',
      relacion
    });
  }

}
