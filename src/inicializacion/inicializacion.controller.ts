import { Controller, Get, HttpStatus, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InicializacionService } from './inicializacion.service';

@Controller('inicializacion')
export class InicializacionController {

    constructor(private inicializacionService: InicializacionService){}

    // Inicializacion de usuarios
    @Get('/usuarios')
    async initUsuarios(@Res() res){
        await this.inicializacionService.initUsuarios();
        res.status(HttpStatus.OK).json({
            message: 'Inicializacion de usuarios completado correctamente'
        })
    }
    
    // Importacion de medicamentos - Archivo excel (.xlsx)
    @UseInterceptors(
        FileInterceptor(
            'file',
            {
                storage: diskStorage({
                    destination: './importar',
                    filename: function(req, file, cb){
                        cb(null, 'productos.xlsx')
                    }
                })
            }
        )
    )
    @Post('/productos')
    async importarProductos(@UploadedFile() file: Express.Multer.File, @Query() query: any) {
        
        const msg = await this.inicializacionService.importarProductos(query);

        return {
            msg
        }

    }

    // Inicializacion de saldos
    @Post('/saldos')
    async initSaldos(@Res() res, @Query() query: any){
        await this.inicializacionService.initSaldos(query);
        res.status(HttpStatus.OK).json({
            message: 'Inicializacion de usuarios completado correctamente'
        })
    }

    // Inicializacion de tipos de movimientos
    @Post('/tipos-movimientos')
    async init(@Res() res, @Query() query: any){
        await this.inicializacionService.initTiposMovimientos(query);
        res.status(HttpStatus.OK).json({
            message: 'Inicializacion de tipos completado correctamente'
        })
    }

}
