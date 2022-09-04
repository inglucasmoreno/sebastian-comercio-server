import { Controller, Get, HttpStatus, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { InicializacionService } from './inicializacion.service';

@ApiTags('Inicializacion')
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
    async importarMedicamentos(@UploadedFile() file: Express.Multer.File, @Query() query: any) {
        
        const msg = await this.inicializacionService.importarProductos(query);

        return {
            msg
        }

    }

}
