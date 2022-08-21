import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { ClientesUpdateDTO } from './dto/clientes-update.dto';
import { ClientesDTO } from './dto/clientes.dto';

@Controller('clientes')
export class ClientesController {
 
    constructor( private clientesService: ClientesService ){}

    // Cliente por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getId(@Res() res, @Param('id') clienteID) {
        const cliente = await this.clientesService.getId(clienteID);
        res.status(HttpStatus.OK).json({
            message: 'Cliente obtenido correctamente',
            cliente
        });
    }
  
    // Listar clientes
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAll(@Res() res, @Query() querys) {
        const clientes = await this.clientesService.getAll(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de clientes correcto',
            clientes
        });
    }
  
    // Crear cliente
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async insert(@Res() res, @Body() clientesDTO: ClientesDTO ) {
        const cliente = await this.clientesService.insert(clientesDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Cliente creado correctamente',
            cliente
        });
    }
      
    // Actualizar cliente
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async update(@Res() res, @Body() clientesUpdateDTO: ClientesUpdateDTO, @Param('id') clienteID ) {
        const cliente = await this.clientesService.update(clienteID, clientesUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Cliente actualizado correctamente',
            cliente
        });
    }

}
