import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComprasChequesService } from './compras-cheques.service';
import { ComprasChequesDTO } from './dto/compras-cheques.dto';

@Controller('compras-cheques')
export class ComprasChequesController {

  constructor(private comprasChequesService: ComprasChequesService) { }

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
    const relacion = await this.comprasChequesService.getId(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion obtenida correctamente',
      relacion
    });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const relaciones = await this.comprasChequesService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de relaciones correcto',
      relaciones
    });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() relacionDTO: ComprasChequesDTO) {
    const relacion = await this.comprasChequesService.insert(relacionDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Relacion creada correctamente',
      relacion
    });
  }

  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() relacionUpdateDTO: ComprasChequesDTO, @Param('id') relacionID) {
    const relacion = await this.comprasChequesService.update(relacionID, relacionUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Relacion actualizada correctamente',
      relacion
    });
  }

}
