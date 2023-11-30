import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOperacionesCompras } from './interface/operaciones-compras.interface';
import { OperacionesComprasDTO } from './dto/operaciones-compras.dto';
import { OperacionesComprasUpdateDTO } from './dto/operaciones-compras-update.dto';

@Injectable()
export class OperacionesComprasService {

  constructor(@InjectModel('OperacionesCompras') private readonly operacionesComprasModel: Model<IOperacionesCompras>) { };

  // OperacionCompra por ID
  async getId(id: string): Promise<IOperacionesCompras> {

    // Se verifica que la OpearcionCompra existe
    const operacionCompraDB = await this.operacionesComprasModel.findById(id);
    if (!operacionCompraDB) throw new NotFoundException('La OperacionCompra no existe');

    const pipeline = [];

    // OperacionCompra por ID
    const idOperacionCompra = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idOperacionCompra } })

    // Informacion de compra
    pipeline.push({
      $lookup: { // Lookup
        from: 'compras',
        localField: 'compra',
        foreignField: '_id',
        as: 'compra'
      }
    }
    );

    pipeline.push({ $unwind: '$compra' });

    // Informacion de operacion
    pipeline.push({
      $lookup: { // Lookup
        from: 'operaciones',
        localField: 'operacion',
        foreignField: '_id',
        as: 'operacion'
      }
    }
    );

    pipeline.push({ $unwind: '$operacion' });

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

    const operacionCompra = await this.operacionesComprasModel.aggregate(pipeline);

    return operacionCompra[0];

  }

  // Listar OperacionesCompras
  async getAll(querys: any): Promise<IOperacionesCompras[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Informacion de compra
    pipeline.push({
      $lookup: { // Lookup
        from: 'compras',
        localField: 'compra',
        foreignField: '_id',
        as: 'compra'
      }
    }
    );

    pipeline.push({ $unwind: '$compra' });

    // Informacion de Compra -> Proveedor
    pipeline.push({
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'compra.proveedor',
        foreignField: '_id',
        as: 'compra.proveedor'
      }
    }
    );

    pipeline.push({ $unwind: '$compra.proveedor' });

    // Informacion de operacion
    pipeline.push({
      $lookup: { // Lookup
        from: 'operaciones',
        localField: 'operacion',
        foreignField: '_id',
        as: 'operacion'
      }
    }
    );

    pipeline.push({ $unwind: '$operacion' });

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

    const operacionesCompras = await this.operacionesComprasModel.aggregate(pipeline);

    return operacionesCompras;

  }

  // Crear OperacionCompra
  async insert(operacionesComprasDTO: OperacionesComprasDTO): Promise<IOperacionesCompras> {

    // La compra ya esta asignada a esta operacion
    const operacionCompraDB = await this.operacionesComprasModel.findOne({ compra: operacionesComprasDTO.compra, operacion: operacionesComprasDTO.operacion });

    if (operacionCompraDB) throw new NotFoundException('La compra ya esta asignada a esta operacion');

    const nuevaOperacionCompra = new this.operacionesComprasModel(operacionesComprasDTO);
    const relacionDB = await nuevaOperacionCompra.save();

    return await this.getId(relacionDB._id);

  }

  // Actualizar OperacionCompra
  async update(id: string, operacionesComprasUpdateDTO: OperacionesComprasUpdateDTO): Promise<IOperacionesCompras> {

    const operacionCompraDB = await this.operacionesComprasModel.findById(id);

    // Verificacion: La OperacionCompra no existe
    if (!operacionCompraDB) throw new NotFoundException('La OperacionCompra no existe');

    const operacionCompra = await this.operacionesComprasModel.findByIdAndUpdate(id, operacionesComprasUpdateDTO, { new: true });
    return operacionCompra;

  }

  // Eliminar OperacionCompra
  async delete(id: string): Promise<IOperacionesCompras> {

    const operacionCompraDB = await this.operacionesComprasModel.findById(id);

    // Verificacion: La OperacionCompra no existe
    if (!operacionCompraDB) throw new NotFoundException('La OperacionCompra no existe');

    await this.operacionesComprasModel.findByIdAndDelete(id);
    return operacionCompraDB;

  }

}
