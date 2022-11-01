import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecibosCobroChequeDTO } from './dto/recibos-cobro-cheque.dto';
import { IRecibosCobroCheque } from './interface/recibos-cheque.interface';

@Injectable()
export class RecibosCobroChequeService {

  constructor(@InjectModel('RecibosCobroCheque') private readonly recibosCobroChequeModel: Model<IRecibosCobroCheque>) { };

  // Relacion por ID
  async getId(id: string): Promise<IRecibosCobroCheque> {

    // Se verifica que la relacion existe
    const relacionDB = await this.recibosCobroChequeModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

    // Informacion de recibo de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'recibos_cobro',
        localField: 'recibo_cobro',
        foreignField: '_id',
        as: 'recibo_cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$recibo_cobro' });

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

    const relacion = await this.recibosCobroChequeModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IRecibosCobroCheque[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Informacion de recibo de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'recibos_cobro',
        localField: 'recibo_cobro',
        foreignField: '_id',
        as: 'recibo_cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$recibo_cobro' });

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

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    const relaciones = await this.recibosCobroChequeModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(relacionDTO: RecibosCobroChequeDTO): Promise<IRecibosCobroCheque> {
    const nuevaRelacion = new this.recibosCobroChequeModel(relacionDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, relacionUpdateDTO: any): Promise<IRecibosCobroCheque> {

    const relacionDB = await this.recibosCobroChequeModel.findById(id);

    // Verificacion: El recibo no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.recibosCobroChequeModel.findByIdAndUpdate(id, relacionUpdateDTO, { new: true });
    return relacion;

  }

}
