import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrdenesPagoUpdateDTO } from './dto/ordenes-pago-update.dto';
import { OrdenesPagoDTO } from './dto/ordenes-pago.dto';
import { IOrdenesPago } from './interface/ordenes-pago.interface';

@Injectable()
export class OrdenesPagoService {

  constructor(
    @InjectModel('OrdenesPago') private readonly ordenesPagoModel: Model<IOrdenesPago>,
  ) { };

  // Orden pago por ID
  async getId(id: string): Promise<IOrdenesPago> {

    // Se verifica que la orden de pago existe
    const ordenPagoDB = await this.ordenesPagoModel.findById(id);
    if (!ordenPagoDB) throw new NotFoundException('La orden de pago no existe');

    const pipeline = [];

    // Orden de pago por ID
    const idOrdenPago = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idOrdenPago } })

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const ordenesPago = await this.ordenesPagoModel.aggregate(pipeline);

    return ordenesPago[0];

  }

  // Listar ordenes de pago
  async getAll(querys: any): Promise<IOrdenesPago[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const ordenesPago = await this.ordenesPagoModel.aggregate(pipeline);

    return ordenesPago;

  }

  // Crear ordenes de pago
  async insert(ordenesPagoDTO: OrdenesPagoDTO): Promise<IOrdenesPago> {
    const nuevaOrdenPago = new this.ordenesPagoModel(ordenesPagoDTO);
    return await nuevaOrdenPago.save();
  }

  // Actualizar orden de pago
  async update(id: string, ordenesPagoUpdateDTO: OrdenesPagoUpdateDTO): Promise<IOrdenesPago> {

    const ordenesPagoDB = await this.ordenesPagoModel.findById(id);

    // Verificacion: La orden de pago no existe
    if (!ordenesPagoDB) throw new NotFoundException('La orden no existe');

    const ordenesPago = await this.ordenesPagoModel.findByIdAndUpdate(id, ordenesPagoUpdateDTO, { new: true });
    return ordenesPago;

  }

}
