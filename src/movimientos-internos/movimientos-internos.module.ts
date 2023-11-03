import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovimientosInternosController } from './movimientos-internos.controller';
import { MovimientosInternosService } from './movimientos-internos.service';
import { MovimientosInternosSchema } from './schema/movimientos-internos.schema';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'MovimientosInternos', schema: MovimientosInternosSchema },
			{ name: 'Usuarios', schema: usuarioSchema },
		])
	],
  controllers: [MovimientosInternosController],
  providers: [MovimientosInternosService]
})
export class MovimientosInternosModule {}
