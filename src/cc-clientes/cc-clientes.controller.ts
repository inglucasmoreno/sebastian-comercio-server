import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CcClientesService } from './cc-clientes.service';
import { CcClientesUpdateDTO } from './dto/cc-clientes-update.dto';
import { CcClientesDTO } from './dto/cc-clientes.dto';

@Controller('cc-clientes')
export class CcClientesController {

    constructor(private cuentasCorrientesService: CcClientesService) { }

    // Cuenta corriente por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getId(@Res() res, @Param('id') cuentasCorrientesID) {
        const cuenta_corriente = await this.cuentasCorrientesService.getId(cuentasCorrientesID);
        res.status(HttpStatus.OK).json({
            message: 'Cuenta corriente obtenida correctamente',
            cuenta_corriente
        });
    }

    // Cuenta corriente por cliente
    @UseGuards(JwtAuthGuard)
    @Get('/cliente/:id')
    async getPorCliente(@Res() res, @Param('id') idCliente) {
        const cuenta_corriente = await this.cuentasCorrientesService.getPorCliente(idCliente);
        res.status(HttpStatus.OK).json({
            message: 'Cuenta corriente obtenida correctamente',
            cuenta_corriente
        });
    }

    // Listar cuentas corrientes
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAll(@Res() res, @Query() querys) {
        const { cuentas_corrientes, totalItems } = await this.cuentasCorrientesService.getAll(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de cuentas corrientes correcto',
            cuentas_corrientes,
            totalItems
        });
    }

    // Crear cuentas corrientes
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async insert(@Res() res, @Body() cuentasCorrientesDTO: CcClientesDTO) {
        const cuenta_corriente = await this.cuentasCorrientesService.insert(cuentasCorrientesDTO);
        res.status(HttpStatus.CREATED).json({
            message: 'Cuenta corriente creada correctamente',
            cuenta_corriente
        });
    }

    // Actualizar cuenta corriente
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async update(@Res() res, @Body() cuentasCorrientesUpdateDTO: CcClientesUpdateDTO, @Param('id') cuentaCorrienteID) {
        const cuenta_corriente = await this.cuentasCorrientesService.update(cuentaCorrienteID, cuentasCorrientesUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Cuenta corriente actualizada correctamente',
            cuenta_corriente
        });
    }

    // Reporte en Excel
    @UseGuards(JwtAuthGuard)
    @Get('/reporte/excel')
    async generarExcel(@Res() res) {
        await this.cuentasCorrientesService.generarExcel();
        res.status(HttpStatus.CREATED).json({
            message: 'Excel generado correctamente',
        });
    }

}
