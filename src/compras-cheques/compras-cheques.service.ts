import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComprasChequesDTO } from './dto/compras-cheques.dto';
import { IComprasCheques } from './interface/compras-cheques.interface';

@Injectable()
export class ComprasChequesService {

  constructor(@InjectModel('ComprasCheques') private readonly comprasChequesModel: Model<IComprasCheques>) { };

  // Relacion por ID
  async getId(id: string): Promise<IComprasCheques> {

    // Se verifica que la relacion existe
    const relacionDB = await this.comprasChequesModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

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

    // Informacion de cheque
    pipeline.push({
      $lookup: { // Lookup
        from: 'cheques',
        localField: 'cheque',
        foreignField: '_id',
        as: 'cheque'
      }
    }
    );

    pipeline.push({ $unwind: '$cheque' });

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

    const relacion = await this.comprasChequesModel.aggregate(pipeline);

    return relacion[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IComprasCheques[]> {

    const { columna, direccion, compra } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    if (compra && compra.trim() !== '') {
      const idCompra = new Types.ObjectId(compra);
      pipeline.push({ $match: { compra: idCompra } })
    }

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

    // Informacion de cheque
    pipeline.push({
      $lookup: { // Lookup
        from: 'cheques',
        localField: 'cheque',
        foreignField: '_id',
        as: 'cheque'
      }
    }
    );

    pipeline.push({ $unwind: '$cheque' });

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'cheque.banco',
        foreignField: '_id',
        as: 'cheque.banco'
      }
    }
    );

    pipeline.push({ $unwind: '$cheque.banco' });

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

    const relaciones = await this.comprasChequesModel.aggregate(pipeline);

    return relaciones;

  }

  // Crear relacion
  async insert(relacionDTO: ComprasChequesDTO): Promise<IComprasCheques> {
    const nuevaRelacion = new this.comprasChequesModel(relacionDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar relacion
  async update(id: string, relacionUpdateDTO: any): Promise<IComprasCheques> {

    const relacionDB = await this.comprasChequesModel.findById(id);

    // Verificacion: La relacion no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.comprasChequesModel.findByIdAndUpdate(id, relacionUpdateDTO, { new: true });
    return relacion;

  }

}
