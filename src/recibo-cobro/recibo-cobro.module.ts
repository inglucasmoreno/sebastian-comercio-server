import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReciboCobroController } from './recibo-cobro.controller';
import { ReciboCobroService } from './recibo-cobro.service';
import { recibosCobrosSchema } from './schema/recibo-cobro.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'RecibosCobros', schema: recibosCobrosSchema },
		])
	],
  controllers: [ReciboCobroController],
  providers: [ReciboCobroService]
})
export class ReciboCobroModule {}
