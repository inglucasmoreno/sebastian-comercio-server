import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CcProveedoresController } from './cc-proveedores.controller';
import { CcProveedoresService } from './cc-proveedores.service';
import { CcProveedoresSchema } from './schema/cc-proveedores.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'CcProveedores', schema: CcProveedoresSchema },
		])
	],
  controllers: [CcProveedoresController],
  providers: [CcProveedoresService]
})
export class CcProveedoresModule {}
