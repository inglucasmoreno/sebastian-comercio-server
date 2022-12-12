import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrdenesPagoCompraDTO } from './dto/ordenes-pago-compra.dto';
import { IOrdenesPagoCompra } from './interface/ordenes-pago-compra.interface';

@Injectable()
export class OrdenesPagoCompraService {

  constructor(@InjectModel('OrdenesPagoCompra') private readonly ordenesPagoCompraModel: Model<IOrdenesPagoCompra>) { };

  // Relacion por ID
  async getId(id: string): Promise<IOrdenesPagoCompra> {

    // Se verifica que la relacion existe
    const relacionDB = await this.ordenesPagoCompraModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

    // Informacion de orden de pago
    pipeline.push({
      $lookup: { // Lookup
        from: 'ordenes_pago',
        localField: 'orden_pago',
        foreignField: '_id',
        as: 'orden_pago'
      }
    }
    );

    pipeline.push({ $unwind: '$orden_pago' });

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

    const relacion = await this.ordenesPagoCompraModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IOrdenesPagoCompra[]> {

    const { columna, direccion, orden_pago, compra } = querys;

    console.log(querys);

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Filtro por orden de pago
    if (orden_pago && orden_pago.trim() !== '') {
      const idOrdenPago = new Types.ObjectId(orden_pago);
      pipeline.push({ $match: { orden_pago: idOrdenPago } })
    }

    // Filtro por compra
    if (compra && compra.trim() !== '') {
      const idCompra = new Types.ObjectId(compra);
      pipeline.push({ $match: { compra: idCompra } })
    }

    // Informacion de orden de pago
    pipeline.push({
      $lookup: { // Lookup
        from: 'ordenes_pago',
        localField: 'orden_pago',
        foreignField: '_id',
        as: 'orden_pago'
      }
    }
    );

    pipeline.push({ $unwind: '$orden_pago' });

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

    const relaciones = await this.ordenesPagoCompraModel.aggregate(pipeline);

    console.log(relaciones);

    return relaciones;

  }

  // Crear relacion
  async insert(relacionDTO: OrdenesPagoCompraDTO): Promise<IOrdenesPagoCompra> {
    const nuevaRelacion = new this.ordenesPagoCompraModel(relacionDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, relacionUpdateDTO: any): Promise<IOrdenesPagoCompra> {

    const relacionDB = await this.ordenesPagoCompraModel.findById(id);

    // Verificacion: El recibo no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.ordenesPagoCompraModel.findByIdAndUpdate(id, relacionUpdateDTO, { new: true });
    return relacion;

  }


}
