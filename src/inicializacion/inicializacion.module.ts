import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InicializacionController } from './inicializacion.controller';
import { InicializacionService } from './inicializacion.service';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { proveedoresSchema } from 'src/proveedores/schema/proveedores.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Usuario', schema: usuarioSchema}]),
    MongooseModule.forFeature([{name: 'Clientes', schema: clientesSchema}]),
    MongooseModule.forFeature([{name: 'Proveedores', schema: proveedoresSchema}]),
  ],
  controllers: [InicializacionController],
  providers: [InicializacionService]
})
export class InicializacionModule {}
