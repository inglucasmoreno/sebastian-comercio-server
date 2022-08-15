import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { productosSchema } from './schema/productos.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Productos', schema: productosSchema }
		])
	],
  providers: [ProductosService],
  controllers: [ProductosController]
})
export class ProductosModule {}
