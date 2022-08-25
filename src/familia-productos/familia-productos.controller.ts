import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FamiliaProductosUpdateDTO } from './dto/familia-productos-update.dto';
import { FamiliaProductosDTO } from './dto/familia-productos.dto';
import { FamiliaProductosService } from './familia-productos.service';

@Controller('familia-productos')
export class FamiliaProductosController {

  constructor( private familiaProductosService: FamiliaProductosService ){}

  // Familia por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') familiaID) {
      const familia = await this.familiaProductosService.getId(familiaID);
      res.status(HttpStatus.OK).json({
          message: 'Familia obtenida correctamente',
          familia
      });
  }

  // Listar familias
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const familias = await this.familiaProductosService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de familias correcto',
          familias
      });
  }

  // Crear familia
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() familiaDTO: FamiliaProductosDTO ) {
      const familia = await this.familiaProductosService.insert(familiaDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Familia creada correctamente',
          familia
      });
  }
    
  // Actualizar familia
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() familiaUpdateDTO: FamiliaProductosUpdateDTO, @Param('id') familiaID ) {
      const familia = await this.familiaProductosService.update(familiaID, familiaUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Familia actualizada correctamente',
          familia
      });
  }  

}
