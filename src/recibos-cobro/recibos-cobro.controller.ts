import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RecibosCobroUpdateDTO } from './dto/recibos-cobro-update.dto';
import { RecibosCobroDTO } from './dto/recibos-cobro.dto';
import { RecibosCobroService } from './recibos-cobro.service';

@Controller('recibos-cobro')
export class RecibosCobroController {

  constructor( private recibosCobroService: RecibosCobroService ){}

  // Recibo por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') reciboID) {
      const recibo = await this.recibosCobroService.getId(reciboID);
      res.status(HttpStatus.OK).json({
          message: 'Recibo obtenido correctamente',
          recibo
      });
  }

  // Generar PDF
  @UseGuards(JwtAuthGuard)
  @Post('/generarPDF')
  async generarPDF(@Res() res, @Body() data: any ) {
      await this.recibosCobroService.generarPDF(data);        
      res.status(HttpStatus.CREATED).json({
          message: 'PDF generado correctamente',
      });
  } 

  // Listar recibos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const { recibos, totalItems } = await this.recibosCobroService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de recibos correcto',
          recibos,
          totalItems
      });
  }

  // Crear recibo
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() recibosCobroDTO: RecibosCobroDTO ) {
      await this.recibosCobroService.insert(recibosCobroDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Recibo creado correctamente',
      });
  }
    
  // Actualizar recibo
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() recibosCobroUpdateDTO: RecibosCobroUpdateDTO, @Param('id') reciboID ) {
      const recibo = await this.recibosCobroService.update(reciboID, recibosCobroUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Recibo actualizado correctamente',
          recibo
      });
  }

}
