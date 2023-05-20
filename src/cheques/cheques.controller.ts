import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChequesService } from './cheques.service';
import { ChequesUpdateDTO } from './dto/cheques-update';
import { ChequesDTO } from './dto/cheques.dto';

@Controller('cheques')
export class ChequesController {

    constructor( private chequesService: ChequesService ){}

    // Cheque por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getId(@Res() res, @Param('id') chequeID) {
        const { cheque, destino, destino_caja } = await this.chequesService.getId(chequeID);
        res.status(HttpStatus.OK).json({
            message: 'Cheque obtenido correctamente',
            cheque,
            destino,
            destino_caja
        });
    }

    // Listar cheques
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAll(@Res() res, @Query() querys) {
        const {cheques, totalItems, montoTotal} = await this.chequesService.getAll(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de cheques correcto',
            cheques,
            montoTotal,
            totalItems
        });
    }

    // Relaciones
    @UseGuards(JwtAuthGuard)
    @Get('/relaciones/:id')
    async getRelaciones(@Res() res, @Param('id') chequeID) {
        const relaciones = await this.chequesService.getRelaciones(chequeID);
        res.status(HttpStatus.OK).json({
            message: 'Listado de relaciones de cheques correcto',
            relaciones
        });
    }

    // Crear cheque
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async insert(@Res() res, @Body() chequesDTO: ChequesDTO ) {
        const cheque = await this.chequesService.insert(chequesDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Cheque creado correctamente',
            cheque
        });
    }
        
    // Actualizar cheque
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async update(@Res() res, @Body() chequesUpdateDTO: ChequesUpdateDTO, @Param('id') chequeID ) {
        const cheque = await this.chequesService.update(chequeID, chequesUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Cheque actualizado correctamente',
            cheque
        });
    }

    // Eliminar cheque
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async delete(@Res() res, @Param('id') chequeID ) {
        const cheque = await this.chequesService.delete(chequeID);
        res.status(HttpStatus.OK).json({
            message: 'Cheque eliminado correctamente',
            cheque
        });
    }

}
