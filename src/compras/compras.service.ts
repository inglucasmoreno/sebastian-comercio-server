import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComprasUpdateDTO } from './dto/compras-update.dto';
import { ComprasDTO } from './dto/compras.dto';
import { ICompras } from './interface/compras.interface';

@Injectable()
export class ComprasService {

  constructor(
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
  ) { };

  // Compra por ID
  async getId(id: string): Promise<ICompras> {

    // Se verifica que la compra existe
    const compraDB = await this.comprasModel.findById(id);
    if (!compraDB) throw new NotFoundException('La compra no existe');

    const pipeline = [];

    // Compra por ID
    const idCompra = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCompra } })

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

    const compras = await this.comprasModel.aggregate(pipeline);

    return compras[0];

  }

  // Listar compras
  async getAll(querys: any): Promise<ICompras[]> {

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

    const compras = await this.comprasModel.aggregate(pipeline);

    return compras;

  }

  // Crear compra
  async insert(compraDTO: ComprasDTO): Promise<ICompras> {
    const nuevaCompra = new this.comprasModel(compraDTO);
    return await nuevaCompra.save();
  }

  // Actualizar compra
  async update(id: string, comprasUpdateDTO: ComprasUpdateDTO): Promise<ICompras> {

    const { activo } = comprasUpdateDTO;

    const compraDB = await this.comprasModel.findById(id);

    // Verificacion: La compra no existe
    if (!compraDB) throw new NotFoundException('La compra no existe');

    const compra = await this.comprasModel.findByIdAndUpdate(id, comprasUpdateDTO, { new: true });
    return compra;

  }

}
