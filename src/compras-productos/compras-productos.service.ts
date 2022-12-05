import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComprasProductosDTO } from './dto/compras-productos.dto';
import { IComprasProductos } from './interface/compras-productos.interface';

@Injectable()
export class ComprasProductosService {

  constructor(
    @InjectModel('ComprasProductos') private readonly comprasProductosModel: Model<IComprasProductos>,
  ) { };

  // Relacion por ID
  async getId(id: string): Promise<IComprasProductos> {

    // Se verifica que la relacion existe
    const relacionDB = await this.comprasProductosModel.findById(id);
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

    const relaciones = await this.comprasProductosModel.aggregate(pipeline);

    return relaciones[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IComprasProductos[]> {

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

    const relaciones = await this.comprasProductosModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(comprasProductosDTO: ComprasProductosDTO): Promise<IComprasProductos> {
    const nuevaRelacion = new this.comprasProductosModel(comprasProductosDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar compra
  async update(id: string, comprasProductosUpdateDTO: any): Promise<IComprasProductos> {

    const relacionDB = await this.comprasProductosModel.findById(id);

    // Verificacion: La relacion no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.comprasProductosModel.findByIdAndUpdate(id, comprasProductosUpdateDTO, { new: true });
    return relacion;

  }


}
