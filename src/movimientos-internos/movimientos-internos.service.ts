import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MovimientosInternosUpdateDTO } from './dto/movimientos-internos-update.dto';
import { MovimientosInternosDTO } from './dto/movimientos-internos.dto';
import { IMovimientosInternos } from './interface/movimientos-internos.interface';

@Injectable()
export class MovimientosInternosService {

  constructor(@InjectModel('MovimientosInternos') private readonly movimientosInternosModel: Model<IMovimientosInternos>) { };

  // Movimientos internos por ID
  async getId(id: string): Promise<IMovimientosInternos> {

    // Se verifica si el movimiento existe
    const movimientoDB = await this.movimientosInternosModel.findById(id);
    if (!movimientoDB) throw new NotFoundException('El movimiento no existe');

    const pipeline = [];

    // Movimiento por ID
    const idMovimiento = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idMovimiento } })

    // Informacion de caja origen
    pipeline.push({
      $lookup: { // Lookup
        from: 'cajas',
        localField: 'caja_origen',
        foreignField: '_id',
        as: 'caja_origen'
      }
    }
    );

    pipeline.push({ $unwind: '$caja_origen' });

    // Informacion de caja destino
    pipeline.push({
      $lookup: { // Lookup
        from: 'cajas',
        localField: 'caja_destino',
        foreignField: '_id',
        as: 'caja_destino'
      }
    }
    );

    pipeline.push({ $unwind: '$caja_destino' });

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

    const movimiento = await this.movimientosInternosModel.aggregate(pipeline);

    return movimiento[0];

  }

  // Listar movimientos
  async getAll(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      parametro,
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Informacion de caja origen
    pipeline.push({
      $lookup: { // Lookup
        from: 'cajas',
        localField: 'caja_origen',
        foreignField: '_id',
        as: 'caja_origen'
      }
    }
    );

    pipeline.push({ $unwind: '$caja_origen' });

    // Informacion de caja destino
    pipeline.push({
      $lookup: { // Lookup
        from: 'cajas',
        localField: 'caja_destino',
        foreignField: '_id',
        as: 'caja_destino'
      }
    }
    );

    pipeline.push({ $unwind: '$caja_destino' });

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

    // Filtro por parametros
    if (parametro && parametro !== '') {

      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for (var i = 0; i < porPartes.length; i++) {
        if (i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal, 'i');
      pipeline.push({ $match: { $or: [{ nro: Number(parametro) }, { 'caja_origen.descripcion': regex }, { 'caja_destino.descripcion': regex }, { 'observacion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }, { 'caja_origen.descripcion': regex }, { 'caja_destino.descripcion': regex }, { 'observacion': regex }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [movimientos, movimientosTotal] = await Promise.all([
      this.movimientosInternosModel.aggregate(pipeline),
      this.movimientosInternosModel.aggregate(pipelineTotal),
    ])

    return {
      movimientos,
      totalItems: movimientosTotal.length,
    };

  }

  // Crear movimiento
  async insert(movimientosInternosDTO: MovimientosInternosDTO): Promise<IMovimientosInternos> {
    const movimientoInterno = new this.movimientosInternosModel(movimientosInternosDTO);
    return await movimientoInterno.save();
  }

  // Actualizar movimiento
  async update(id: string, movimientosInternosUpdateDTO: MovimientosInternosUpdateDTO): Promise<IMovimientosInternos> {
    const movimientoInterno = await this.movimientosInternosModel.findByIdAndUpdate(id, movimientosInternosUpdateDTO, { new: true });
    return movimientoInterno;
  }

}
