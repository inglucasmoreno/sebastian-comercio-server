import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecibosCobroVentaDTO } from './dto/recibos-cobro-venta.dto';
import { IRecibosCobroVenta } from './interface/recibos-cobro-venta.interface';

@Injectable()
export class RecibosCobroVentaService {

  constructor(@InjectModel('RecibosCobroVenta') private readonly recibosCobroVentaModel: Model<IRecibosCobroVenta>) { };

  // Relacion por ID
  async getId(id: string): Promise<IRecibosCobroVenta> {

    // Se verifica que la relacion existe
    const relacionDB = await this.recibosCobroVentaModel.findById(id);
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

    const relacion = await this.recibosCobroVentaModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IRecibosCobroVenta[]> {

    const { columna, direccion, recibo_cobro, venta_propia } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Filtro por recibo de cobro
    if(recibo_cobro && recibo_cobro.trim() !== '') {
      const idReciboCobro = new Types.ObjectId(recibo_cobro);
      pipeline.push({ $match: { recibo_cobro: idReciboCobro } })
    }

    // Filtro por venta propia
    if(venta_propia && venta_propia.trim() !== '') {
      const idVentaPropia = new Types.ObjectId(venta_propia);
      pipeline.push({ $match: { venta_propia: idVentaPropia } })
    }

    // Informacion de recibo de cobro
    pipeline.push({
      $lookup: { // Lookup
        from: 'recibos_cobros',
        localField: 'recibo_cobro',
        foreignField: '_id',
        as: 'recibo_cobro'
      }
    }
    );

    pipeline.push({ $unwind: '$recibo_cobro' });

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

    const relaciones = await this.recibosCobroVentaModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(relacionDTO: RecibosCobroVentaDTO): Promise<IRecibosCobroVenta> {
    const nuevaRelacion = new this.recibosCobroVentaModel(relacionDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, relacionUpdateDTO: any): Promise<IRecibosCobroVenta> {

    const relacionDB = await this.recibosCobroVentaModel.findById(id);

    // Verificacion: El recibo no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.recibosCobroVentaModel.findByIdAndUpdate(id, relacionUpdateDTO, { new: true });
    return relacion;

  }


}
