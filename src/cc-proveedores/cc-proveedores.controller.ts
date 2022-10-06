import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CcProveedoresService } from './cc-proveedores.service';
import { CcProveedoresUpdateDTO } from './dto/cc-proveedores-update.dto';
import { CcProveedoresDTO } from './dto/cc-proveedores.dto';

@Controller('cc-proveedores')
export class CcProveedoresController {

  constructor( private cuentasCorrientesService: CcProveedoresService ){}

  // Proveedor por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getId(@Res() res, @Param('id') cuentasCorrientesID) {
      const cuenta_corriente = await this.cuentasCorrientesService.getId(cuentasCorrientesID);
      res.status(HttpStatus.OK).json({
          message: 'Cuenta corriente obtenida correctamente',
          cuenta_corriente
      });
  }

  // Listar cuentas corrientes
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAll(@Res() res, @Query() querys) {
      const cuentas_corrientes = await this.cuentasCorrientesService.getAll(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de cuentas corrientes correcto',
          cuentas_corrientes
      });
  }

  // Crear cuentas corrientes
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async insert(@Res() res, @Body() cuentasCorrientesDTO: CcProveedoresDTO ) {
      const cuenta_corriente = await this.cuentasCorrientesService.insert(cuentasCorrientesDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Cuenta corriente creada correctamente',
          cuenta_corriente
      });
  }
    
  // Actualizar cuenta corriente
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(@Res() res, @Body() cuentasCorrientesUpdateDTO: CcProveedoresUpdateDTO, @Param('id') cuentaCorrienteID ) {
      const cuenta_corriente = await this.cuentasCorrientesService.update(cuentaCorrienteID, cuentasCorrientesUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Cuenta corriente actualizada correctamente',
          cuenta_corriente
      });
  }


}
