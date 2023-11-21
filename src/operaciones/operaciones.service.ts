import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IOperaciones } from './interface/operaciones.interface';
import { OperacionesDTO } from './dto/operaciones.dto';
import { OperacionesUpdateDTO } from './dto/operaciones-update.dto';
import { IOperacionesVentasPropias } from 'src/operaciones-ventas-propias/interface/operaciones-ventas-propias.interface';
import { IOperacionesCompras } from 'src/operaciones-compras/interface/operaciones-compras.interface';
import { add } from 'date-fns';

@Injectable()
export class OperacionesService {

  constructor(
    @InjectModel('Operaciones') private readonly operacionesModel: Model<IOperaciones>,
    @InjectModel('OperacionesVentasPropias') private readonly operacionesVentasPropiasModel: Model<IOperacionesVentasPropias>,
    @InjectModel('OperacionesCompras') private readonly operacionesComprasModel: Model<IOperacionesCompras>,
  ) { };

  // Operaciones por ID
  async getId(id: string): Promise<any> {

    // Se verifica que la operacion existe
    const operacionDB = await this.operacionesModel.findById(id);
    if (!operacionDB) throw new NotFoundException('La operacion no existe');

    const pipeline = [];

    // TODO: Informacion de la operacion

    const idOperacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idOperacion } })

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

    // TODO: Se listan las ventas propias de la operacion

    const pipelineVentasPropias = [];
    pipelineVentasPropias.push({ $match: { operacion: idOperacion } })

    // Informacion de venta propia
    pipelineVentasPropias.push({
      $lookup: { // Lookup
        from: 'ventas_propias',
        localField: 'venta_propia',
        foreignField: '_id',
        as: 'venta_propia'
      }
    }
    );

    pipelineVentasPropias.push({ $unwind: '$venta_propia' });

    // Informacion de venta propia -> Cliente
    pipelineVentasPropias.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'venta_propia.cliente',
        foreignField: '_id',
        as: 'venta_propia.cliente'
      }
    }
    );

    pipelineVentasPropias.push({ $unwind: '$venta_propia.cliente' });

    // Informacion de usuario creador
    pipelineVentasPropias.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipelineVentasPropias.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipelineVentasPropias.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipelineVentasPropias.push({ $unwind: '$updatorUser' });


    // TODO: Se listan las compras de la operacion

    const pipelineCompras = [];
    pipelineCompras.push({ $match: { operacion: idOperacion } })

    // Informacion de compra
    pipelineCompras.push({
      $lookup: { // Lookup
        from: 'compras',
        localField: 'compra',
        foreignField: '_id',
        as: 'compra'
      }
    }
    );

    pipelineCompras.push({ $unwind: '$compra' });

    // Informacion de compra -> proveedor
    pipelineCompras.push({
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'compra.proveedor',
        foreignField: '_id',
        as: 'compra.proveedor'
      }
    }
    );

    pipelineCompras.push({ $unwind: '$compra.proveedor' });

    // Informacion de usuario creador
    pipelineCompras.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipelineCompras.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipelineCompras.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipelineCompras.push({ $unwind: '$updatorUser' });


    const [operacion, operacionVentasPropias, operacionCompras] = await Promise.all([
      this.operacionesModel.aggregate(pipeline),
      this.operacionesVentasPropiasModel.aggregate(pipelineVentasPropias),
      this.operacionesComprasModel.aggregate(pipelineCompras),
    ]);

    return {
      operacion: operacion[0],
      operacionVentasPropias,
      operacionCompras
    };

  }

  // Listar operaciones
  async getAll(querys: any): Promise<IOperaciones[]> {

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

    const operaciones = await this.operacionesModel.aggregate(pipeline);

    return operaciones;

  }

  // Crear operacion
  async insert(operacionesDTO: OperacionesDTO): Promise<IOperaciones> {

    // Se le agrega el numero a la operacion donde el numero es el ultimo numero de la operacion + 1 usando find
    const operacionDB = await this.operacionesModel.find().sort({ numero: -1 }).limit(1);
    if (operacionDB.length === 0) operacionesDTO.numero = 1;
    else operacionesDTO.numero = operacionDB[0].numero + 1;

    operacionesDTO.fecha_operacion = add(new Date(operacionesDTO.fecha_operacion), { hours: 3 });

    const operacion = new this.operacionesModel(operacionesDTO);
    return await operacion.save();
    
  }

  // Actualizar operacion
  async update(id: string, operacionesUpdateDTO: OperacionesUpdateDTO): Promise<IOperaciones> {

    if(operacionesUpdateDTO.fecha_operacion){
      operacionesUpdateDTO.fecha_operacion = add(new Date(operacionesUpdateDTO.fecha_operacion), { hours: 3 });
    }

    const operacionDB = await this.operacionesModel.findById(id);

    // Verificacion: La operacion no existe
    if (!operacionDB) throw new NotFoundException('La operacion no existe');

    const operacion = await this.operacionesModel.findByIdAndUpdate(id, operacionesUpdateDTO, { new: true });
    return operacion;

  }

}
