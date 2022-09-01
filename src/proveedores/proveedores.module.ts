import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { proveedoresSchema } from './schema/proveedores.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Proveedores', schema: proveedoresSchema },
		])
	],
  providers: [ProveedoresService],
  controllers: [ProveedoresController]
})
export class ProveedoresModule {
	
}
