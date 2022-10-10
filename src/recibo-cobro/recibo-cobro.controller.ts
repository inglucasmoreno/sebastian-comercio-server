import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RecibosCobrosUpdateDTO } from './dto/recibo-cobro-update';
import { RecibosCobrosDTO } from './dto/recibo-cobro.dto';
import { ReciboCobroService } from './recibo-cobro.service';

@Controller('recibo-cobro')
export class ReciboCobroController {

  constructor( private recibosCobrosService: ReciboCobroService ){}

  // Recibo por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') reciboID) {
      const recibo = await this.recibosCobrosService.getId(reciboID);
      res.status(HttpStatus.OK).json({
          message: 'Recibo obtenido correctamente',
          recibo
      });
  }

  // Listar recibos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const recibos = await this.recibosCobrosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de recibos correcto',
          recibos
      });
  }

  // Crear recibo
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() recibosCobrosDTO: RecibosCobrosDTO ) {
      const recibo = await this.recibosCobrosService.insert(recibosCobrosDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Recibo creado correctamente',
          recibo
      });
  }
    
  // Actualizar recibo
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() recibosCobrosUpdateDTO: RecibosCobrosUpdateDTO, @Param('id') reciboID ) {
      const recibo = await this.recibosCobrosService.update(reciboID, recibosCobrosUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Recibo actualizada correctamente',
          recibo
      });
  }

}
