import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { unidadMedidadSchema } from './schema/unidad-medida.schema';
import { UnidadMedidaController } from './unidad-medida.controller';
import { UnidadMedidaService } from './unidad-medida.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'UnidadMedida', schema: unidadMedidadSchema },
			{ name: 'Productos', schema: productosSchema },
		])
	],
	controllers: [UnidadMedidaController],
	providers: [UnidadMedidaService]
})
export class UnidadMedidaModule {}
		