import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrdenesPagoCajasDTO } from './dto/ordenes-pago-cajas.dto';
import { IOrdenesPagoCajas } from './interface/ordenes-pago-cajas.interface';

@Injectable()
export class OrdenesPagoCajasService {

  constructor(
    @InjectModel('OrdenesPagoCajas') private readonly ordenesPagoCajasModel: Model<IOrdenesPagoCajas>,
  ) { };

  // Relacion por ID
  async getId(id: string): Promise<IOrdenesPagoCajas> {

    // Se verifica que la relacion existe
    const relacionDB = await this.ordenesPagoCajasModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

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

    const relaciones = await this.ordenesPagoCajasModel.aggregate(pipeline);

    return relaciones[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IOrdenesPagoCajas[]> {

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

    const relaciones = await this.ordenesPagoCajasModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(ordenesPagoCajasDTO: OrdenesPagoCajasDTO): Promise<IOrdenesPagoCajas> {
    const nuevaRelacion = new this.ordenesPagoCajasModel(ordenesPagoCajasDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, ordenesPagoCajasUpdateDTO: any): Promise<IOrdenesPagoCajas> {

    const relacionDB = await this.ordenesPagoCajasModel.findById(id);

    // Verificacion: La relacion no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.ordenesPagoCajasModel.findByIdAndUpdate(id, ordenesPagoCajasUpdateDTO, { new: true });
    return relacion;

  }

}
