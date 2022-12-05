import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComprasCajasDTO } from './dto/compras-cajas.dto';
import { IComprasCajas } from './interface/compras-cajas.interface';

@Injectable()
export class ComprasCajasService {

  constructor(
    @InjectModel('ComprasCajas') private readonly comprasCajasModel: Model<IComprasCajas>,
  ) { };

  // Relacion por ID
  async getId(id: string): Promise<IComprasCajas> {

    // Se verifica que la relacion existe
    const relacionDB = await this.comprasCajasModel.findById(id);
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

    const relaciones = await this.comprasCajasModel.aggregate(pipeline);

    return relaciones[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IComprasCajas[]> {

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

    const relaciones = await this.comprasCajasModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(comprasCajasDTO: ComprasCajasDTO): Promise<IComprasCajas> {
    const nuevaRelacion = new this.comprasCajasModel(comprasCajasDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, comprasCajasUpdateDTO: any): Promise<IComprasCajas> {

    const relacionDB = await this.comprasCajasModel.findById(id);

    // Verificacion: La relacion no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.comprasCajasModel.findByIdAndUpdate(id, comprasCajasUpdateDTO, { new: true });
    return relacion;

  }

}
