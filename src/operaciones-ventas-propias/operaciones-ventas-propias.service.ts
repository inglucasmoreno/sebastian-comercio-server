import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOperacionesVentasPropias } from './interface/operaciones-ventas-propias.interface';
import { OperacionesVentasPropiasDTO } from './dto/operaciones-ventas-propias.dto';
import { OperacionesVentasPropiasUpdateDTO } from './dto/operaciones-ventas-propias-update.dto';

@Injectable()
export class OperacionesVentasPropiasService {

  constructor(@InjectModel('OperacionesVentasPropias') private readonly operacionesVentasPropiasModel: Model<IOperacionesVentasPropias>) { };

  // OperacionVentaPropia por ID
  async getId(id: string): Promise<IOperacionesVentasPropias> {

    // Se verifica que la OpearcionVentaPropia existe
    const operacionVentaPropiaDB = await this.operacionesVentasPropiasModel.findById(id);
    if (!operacionVentaPropiaDB) throw new NotFoundException('La OperacionVentaPropia no existe');

    const pipeline = [];

    // OperacionVentaPropia por ID
    const idOperacionVentaPropia = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idOperacionVentaPropia } })

    // Informacion de VentaPropia
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_propias',
        localField: 'venta_propia',
        foreignField: '_id',
        as: 'venta_propia'
      }
    }
    );

    pipeline.push({ $unwind: '$venta_propia' });

    // Informacion de Venta propia -> Cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'venta_propia.cliente',
        foreignField: '_id',
        as: 'venta_propia.cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$venta_propia.cliente' });

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

    const operacionVentaPropia = await this.operacionesVentasPropiasModel.aggregate(pipeline);

    return operacionVentaPropia[0];

  }

  // Listar OperacionesVentasPropias
  async getAll(querys: any): Promise<IOperacionesVentasPropias[]> {

    const {
      columna,
      operacion,
      direccion
    } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });


    // Filtrado por operacion
    if (operacion) {
      const idOperacion = new Types.ObjectId(operacion);
      pipeline.push({ $match: { operacion: idOperacion } });
    }

    // Informacion de venta propia
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_propias',
        localField: 'venta_propia',
        foreignField: '_id',
        as: 'venta_propia'
      }
    }
    );

    pipeline.push({ $unwind: '$venta_propia' });

    // Informacion de Venta propia -> Cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'venta_propia.cliente',
        foreignField: '_id',
        as: 'venta_propia.cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$venta_propia.cliente' });

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

    console.log(operacion);

    const operacionesVentasPropias = await this.operacionesVentasPropiasModel.aggregate(pipeline);

    return operacionesVentasPropias;

  }

  // Crear OperacionVentaPropia
  async insert(operacionesVentasPropiasDTO: OperacionesVentasPropiasDTO): Promise<IOperacionesVentasPropias> {

    // La venta-propia ya esta asignada a esta operacion
    const operacionVentaPropiaDB = await this.operacionesVentasPropiasModel.findOne({ venta_propia: operacionesVentasPropiasDTO.venta_propia, operacion: operacionesVentasPropiasDTO.operacion });

    if (operacionVentaPropiaDB) throw new NotFoundException('La venta ya esta asignada a esta operacion');

    const nuevaOperacionVentaPropia = new this.operacionesVentasPropiasModel(operacionesVentasPropiasDTO);
    return await nuevaOperacionVentaPropia.save();

  }

  // Actualizar OperacionVentaPropia
  async update(id: string, operacionesVentasPropiasUpdateDTO: OperacionesVentasPropiasUpdateDTO): Promise<IOperacionesVentasPropias> {

    const operacionVentaPropiaDB = await this.operacionesVentasPropiasModel.findById(id);

    // Verificacion: La OperacionVentaPropia no existe
    if (!operacionVentaPropiaDB) throw new NotFoundException('La OperacionVentaPropia no existe');

    const operacionVentaPropia = await this.operacionesVentasPropiasModel.findByIdAndUpdate(id, operacionesVentasPropiasUpdateDTO, { new: true });
    return operacionVentaPropia;

  }

  // Eliminar OperacionVentaPropia
  async delete(id: string): Promise<IOperacionesVentasPropias> {

    const operacionVentaPropiaDB = await this.operacionesVentasPropiasModel.findById(id);

    // Verificacion: La OperacionVentaPropia no existe
    if (!operacionVentaPropiaDB) throw new NotFoundException('La OperacionVentaPropia no existe');

    await this.operacionesVentasPropiasModel.findByIdAndDelete(id);
    return operacionVentaPropiaDB;

  }

}
