import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProveedoresUpdateDTO } from './dto/proveedores-update.dto';
import { ProveedoresDTO } from './dto/proveedores.dto';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
export class ProveedoresController {

    constructor( private proveedoresService: ProveedoresService ){}

    // Proveedor por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getId(@Res() res, @Param('id') proveedorID) {
        const proveedor = await this.proveedoresService.getId(proveedorID);
        res.status(HttpStatus.OK).json({
            message: 'Proveedor obtenido correctamente',
            proveedor
        });
    }
  
    // Listar proveedores
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAll(@Res() res, @Query() querys) {
        const {proveedores, totalItems} = await this.proveedoresService.getAll(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de proveedores correcto',
            proveedores,
            totalItems
        });
    }
  
    // Crear proveedor
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async insert(@Res() res, @Body() proveedoresDTO: ProveedoresDTO ) {
        const proveedor = await this.proveedoresService.insert(proveedoresDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Proveedor creado correctamente',
            proveedor
        });
    }
      
    // Actualizar proveedor
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async update(@Res() res, @Body() proveedoresUpdateDTO: ProveedoresUpdateDTO, @Param('id') proveedorID ) {
        const proveedor = await this.proveedoresService.update(proveedorID, proveedoresUpdateDTO);
        res.status(HttpStatus.OK).json({
            message: 'Proveedor actualizado correctamente',
            proveedor
        });
    }

}
