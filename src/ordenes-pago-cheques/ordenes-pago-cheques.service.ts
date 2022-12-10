import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrdenesPagoChequesDTO } from './dto/ordenes-pago-cheques.dto';
import { IOrdenesPagoCheques } from './interface/ordenes-pago-cheques.interface';

@Injectable()
export class OrdenesPagoChequesService {

  constructor(@InjectModel('OrdenesPagoCheques') private readonly ordenesPagoChequesModel: Model<IOrdenesPagoCheques>) { };

  // Relacion por ID
  async getId(id: string): Promise<IOrdenesPagoCheques> {

    // Se verifica que la relacion existe
    const relacionDB = await this.ordenesPagoChequesModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

    // Informacion de orden de pago
    pipeline.push({
      $lookup: { // Lookup
        from: 'ordenes_pago',
        localField: 'orden_pago',
        foreignField: '_id',
        as: 'orden_pago'
      }
    }
    );

    pipeline.push({ $unwind: '$orden_pago' });

    // Informacion de cheque
    pipeline.push({
      $lookup: { // Lookup
        from: 'cheques',
        localField: 'cheque',
        foreignField: '_id',
        as: 'cheque'
      }
    }
    );

    pipeline.push({ $unwind: '$cheque' });

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

    const relacion = await this.ordenesPagoChequesModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IOrdenesPagoCheques[]> {

    const { columna, direccion, orden_pago } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    if (orden_pago && orden_pago.trim() !== '') {
      const idOrdenPago = new Types.ObjectId(orden_pago);
      pipeline.push({ $match: { orden_pago: idOrdenPago } })
    }

    // Informacion de orden de pago
    pipeline.push({
      $lookup: { // Lookup
        from: 'ordenes_pago',
        localField: 'orden_pago',
        foreignField: '_id',
        as: 'orden_pago'
      }
    }
    );

    pipeline.push({ $unwind: '$orden_pago' });

    // Informacion de cheque
    pipeline.push({
      $lookup: { // Lookup
        from: 'cheques',
        localField: 'cheque',
        foreignField: '_id',
        as: 'cheque'
      }
    }
    );

    pipeline.push({ $unwind: '$cheque' });

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'cheque.banco',
        foreignField: '_id',
        as: 'cheque.banco'
      }
    }
    );

    pipeline.push({ $unwind: '$cheque.banco' });

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

    const relaciones = await this.ordenesPagoChequesModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(relacionDTO: OrdenesPagoChequesDTO): Promise<IOrdenesPagoCheques> {
    const nuevaRelacion = new this.ordenesPagoChequesModel(relacionDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, relacionUpdateDTO: any): Promise<IOrdenesPagoCheques> {

    const relacionDB = await this.ordenesPagoChequesModel.findById(id);

    // Verificacion: La relacion no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.ordenesPagoChequesModel.findByIdAndUpdate(id, relacionUpdateDTO, { new: true });
    return relacion;

  }

}
