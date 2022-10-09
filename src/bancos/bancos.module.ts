import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';
import { bancosSchema } from './schema/bancos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Bancos', schema: bancosSchema },
		])
	],
  controllers: [BancosController],
  providers: [BancosService]
})
export class BancosModule {}
