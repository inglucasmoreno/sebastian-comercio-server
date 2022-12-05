import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComprasCajasService } from './compras-cajas.service';
import { ComprasCajasUpdateDTO } from './dto/compras-cajas-update.dto';
import { ComprasCajasDTO } from './dto/compras-cajas.dto';

@Controller('compras-cajas')
export class ComprasCajasController {

  constructor(private comprasCajasService: ComprasCajasService) { }

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
    const relacion = await this.comprasCajasService.getId(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion obtenida correctamente',
      relacion
    });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
    const relaciones = await this.comprasCajasService.getAll(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de relaciones correcto',
      relaciones
    });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() comprasCajasDTO: ComprasCajasDTO) {
    const relacion = await this.comprasCajasService.insert(comprasCajasDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Relacion creada correctamente',
      relacion
    });
  }

  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() comprasCajasUpdateDTO: ComprasCajasUpdateDTO, @Param('id') relacionID) {
    const relacion = await this.comprasCajasService.update(relacionID, comprasCajasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Relacion actualizada correctamente',
      relacion
    });
  }

}
