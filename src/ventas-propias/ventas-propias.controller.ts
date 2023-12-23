import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasPropiasUpdateDTO } from './dto/ventas-propias-update';
import { VentasPropiasDTO } from './dto/ventas-propias.dto';
import { VentasPropiasService } from './ventas-propias.service';

@Controller('ventas-propias')
export class VentasPropiasController {

    constructor(private ventasPropiasService: VentasPropiasService) { }

    // Venta por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getId(@Res() res, @Param('id') ventaID) {
        const { venta, operacion  }= await this.ventasPropiasService.getId(ventaID);
        res.status(HttpStatus.OK).json({
            message: 'Venta obtenida correctamente',
            venta,
            operacion
        });
    }

    // Listar ventas
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAll(@Res() res, @Query() querys) {
        const {ventas, totalItems} = await this.ventasPropiasService.getAll(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de ventas correcto',
            ventas,
            totalItems
        });
    }

    // Crear venta
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async insert(@Res() res, @Body() ventasDTO: VentasPropiasDTO) {
        await this.ventasPropiasService.insert(ventasDTO);
        res.status(HttpStatus.CREATED).json({
            message: 'Venta creada correctamente',
        });
    }

    // Actualizar venta
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async update(@Res() res, @Body() ventasUpdateDTO: VentasPropiasUpdateDTO, @Param('id') ventaID) {
        const venta = await this.ventasPropiasService.update(ventaID, ventasUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Venta actualizada correctamente',
            venta
        });
    }

    // Alta/Baja de venta propia
    @UseGuards(JwtAuthGuard)
    @Put('/alta-baja/:id')
    async altaBaja(@Res() res, @Body() data: any, @Param('id') ventaID) {
        const venta = await this.ventasPropiasService.altaBaja(ventaID, data);
        res.status(HttpStatus.OK).json({
            message: 'Venta actualizada correctamente',
            venta
        });
    }

    // Generar PDF
    @UseGuards(JwtAuthGuard)
    @Post('/generarPDF')
    async generarPDF(@Res() res, @Body() data: any) {
        await this.ventasPropiasService.generarPDF(data);
        res.status(HttpStatus.CREATED).json({
            message: 'PDF generado correctamente',
        });
    }

    // Reporte en Excel
    @UseGuards(JwtAuthGuard)
    @Post('/reporte/excel')
    async generarExcel(@Res() res, @Body() data: any) {
        await this.ventasPropiasService.generarExcel(data);
        res.status(HttpStatus.CREATED).json({
            message: 'Excel generado correctamente',
        });
    }

}
