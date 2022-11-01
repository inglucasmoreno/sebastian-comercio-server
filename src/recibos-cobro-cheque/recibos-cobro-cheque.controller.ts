import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RecibosCobroChequeDTO } from './dto/recibos-cobro-cheque.dto';
import { RecibosCobroChequeService } from './recibos-cobro-cheque.service';

@Controller('recibos-cobro-cheque')
export class RecibosCobroChequeController {

  constructor( private recibosCobroChequeService: RecibosCobroChequeService ){}

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') relacionID) {
      const relacion = await this.recibosCobroChequeService.getId(relacionID);
      res.status(HttpStatus.OK).json({
          message: 'Relacion obtenida correctamente',
          relacion
      });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const relaciones = await this.recibosCobroChequeService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de relaciones correcto',
          relaciones
      });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() relacionDTO: RecibosCobroChequeDTO ) {
      const relacion = await this.recibosCobroChequeService.insert(relacionDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Relacion creada correctamente',
          relacion
      });
  }
    
  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() relacionUpdateDTO: RecibosCobroChequeDTO, @Param('id') relacionID ) {
      const relacion = await this.recibosCobroChequeService.update(relacionID, relacionUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Relacion actualizada correctamente',
          relacion
      });
  }

}
