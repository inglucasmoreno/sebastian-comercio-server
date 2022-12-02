import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TiposGastosUpdateDTO } from './dto/tipos-gastos-update.dto';
import { TiposGastosDTO } from './dto/tipos-gastos.dto';
import { ITiposGastos } from './interface/tipos-gastos.interface';

@Injectable()
export class TiposGastosService {

  constructor(
    @InjectModel('TiposGastos') private readonly tiposGastosModel: Model<ITiposGastos>,
  ) { };

  // Tipo por ID
  async getId(id: string): Promise<ITiposGastos> {

    // Se verifica que el tipo existe
    const tipoDB = await this.tiposGastosModel.findById(id);
    if (!tipoDB) throw new NotFoundException('El tipo de gasto no existe');

    const pipeline = [];

    // Tipo por ID
    const idTipo = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idTipo } })

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

    const tipo = await this.tiposGastosModel.aggregate(pipeline);

    return tipo[0];

  }

  // Listar tipos
  async getAll(querys: any): Promise<ITiposGastos[]> {

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

    const tipos = await this.tiposGastosModel.aggregate(pipeline);

    return tipos;

  }

  // Crear tipo
  async insert(tiposDTO: TiposGastosDTO): Promise<ITiposGastos> {

    // Verificacion: descripcion repetida
    const tipo = await this.tiposGastosModel.findOne({ descripcion: tiposDTO.descripcion.trim().toUpperCase() })
    if (tipo) throw new NotFoundException('El tipo de gasto ya se encuentra cargado');

    const nuevoTipo = new this.tiposGastosModel(tiposDTO);
    return await nuevoTipo.save();
  }

  // Actualizar tipo
  async update(id: string, tiposGastosUpdateDTO: TiposGastosUpdateDTO): Promise<ITiposGastos> {

    const { descripcion, activo } = tiposGastosUpdateDTO;

    const tipoDB = await this.tiposGastosModel.findById(id);

    // Verificacion: El tipo no existe
    if (!tipoDB) throw new NotFoundException('El tipo no existe');

    // Verificacion: descripcion repetida
    if (descripcion) {
      const tipoDescripcion = await this.tiposGastosModel.findOne({ descripcion: descripcion.trim().toUpperCase() })
      if (tipoDescripcion && tipoDescripcion._id.toString() !== id) throw new NotFoundException('El tipo de gasto ya se encuentra cargado');
    }

    const tipo = await this.tiposGastosModel.findByIdAndUpdate(id, tiposGastosUpdateDTO, { new: true });
    return tipo;

  }

}
