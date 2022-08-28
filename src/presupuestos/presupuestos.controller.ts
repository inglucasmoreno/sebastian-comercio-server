import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PresupuestosUpdateDTO } from './dto/presupuestos-update.dto';
import { PresupuestosDTO } from './dto/presupuestos.dto';
import { PresupuestosService } from './presupuestos.service';

@Controller('presupuestos')
export class PresupuestosController {

    constructor( private presupuestosService: PresupuestosService ){}

    // Presupuesto por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getId(@Res() res, @Param('id') presupuestoID) {
        const presupuesto = await this.presupuestosService.getId(presupuestoID);
        res.status(HttpStatus.OK).json({
            message: 'Presupuesto obtenido correctamente',
            presupuesto
        });
    }
  
    // Listar presupuestos
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAll(@Res() res, @Query() querys) {
        const presupuestos = await this.presupuestosService.getAll(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de presupuestos correcto',
            presupuestos
        });
    }
  
    // Crear presupuesto
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async insert(@Res() res, @Body() presupuestosDTO: PresupuestosDTO ) {
        await this.presupuestosService.insert(presupuestosDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Presupuesto creado correctamente',
        });
    }
      
    // Actualizar presupuesto
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async update(@Res() res, @Body() presupuestosUpdateDTO: PresupuestosUpdateDTO, @Param('id') presupuestoID ) {
        const presupuesto = await this.presupuestosService.update(presupuestoID, presupuestosUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Presupuesto actualizado correctamente',
            presupuesto
        });
    }

    // Generar PDF
    @UseGuards(JwtAuthGuard)
    @Post('/generarPDF')
    async generarPDF(@Res() res, @Body() data: any ) {
        await this.presupuestosService.generarPDF(data);        
        res.status(HttpStatus.CREATED).json({
            message: 'PDF generado correctamente',
        });
    } 

}
