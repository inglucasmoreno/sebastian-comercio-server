import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { FamiliaProductosController } from './familia-productos.controller';
import { FamiliaProductosService } from './familia-productos.service';
import { familiaProductosSchema } from './schema/familia-productos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'FamiliaProductos', schema: familiaProductosSchema },
			{ name: 'Productos', schema: productosSchema },
		])
	],
  controllers: [FamiliaProductosController],
  providers: [FamiliaProductosService]
})
export class FamiliaProductosModule {}
