import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { productosSchema } from './schema/productos.schema';
import { unidadMedidadSchema } from 'src/unidad-medida/schema/unidad-medida.schema';
import { familiaProductosSchema } from 'src/familia-productos/schema/familia-productos.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Productos', schema: productosSchema },
			{ name: 'UnidadMedida', schema: unidadMedidadSchema },
			{ name: 'FamiliaProductos', schema: familiaProductosSchema },
		])
	],
  providers: [ProductosService],
  controllers: [ProductosController]
})
export class ProductosModule {}
