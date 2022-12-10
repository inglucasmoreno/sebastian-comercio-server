import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrdenesPagoChequesDTO } from './dto/ordenes-pago-cheques.dto';
import { OrdenesPagoChequesService } from './ordenes-pago-cheques.service';

@Controller('ordenes-pago-cheques')
export class OrdenesPagoChequesController {

  constructor(private ordenesPagoChequesService: OrdenesPagoChequesService) { }

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
    const relacion = await this.ordenesPagoChequesService.getId(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion obtenida correctamente',
      relacion
    });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const relaciones = await this.ordenesPagoChequesService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de relaciones correcto',
      relaciones
    });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() relacionDTO: OrdenesPagoChequesDTO) {
    const relacion = await this.ordenesPagoChequesService.insert(relacionDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Relacion creada correctamente',
      relacion
    });
  }

  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() relacionUpdateDTO: OrdenesPagoChequesDTO, @Param('id') relacionID) {
    const relacion = await this.ordenesPagoChequesService.update(relacionID, relacionUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Relacion actualizada correctamente',
      relacion
    });
  }

}
