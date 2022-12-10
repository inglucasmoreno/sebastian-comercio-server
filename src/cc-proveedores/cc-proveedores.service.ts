import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CcProveedoresDTO } from './dto/cc-proveedores.dto';
import { ICcProveedores } from './interface/cc-proveedores.interface';

@Injectable()
export class CcProveedoresService {

  constructor(@InjectModel('CcProveedores') private readonly cuentaCorrienteModel: Model<ICcProveedores>) { };

  // CC por ID
  async getId(id: string): Promise<ICcProveedores> {

    // Se verifica que la CC existe
    const cuentaCorrienteDB = await this.cuentaCorrienteModel.findById(id);
    if (!cuentaCorrienteDB) throw new NotFoundException('La cuenta corriente no existe');

    const pipeline = [];

    // Cuenta corriente por ID
    const idCuentaCorriente = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCuentaCorriente } })

    // Informacion de proveedor
    pipeline.push({
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }
    );

    pipeline.push({ $unwind: '$proveedor' });


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

    const cuentaCorriente = await this.cuentaCorrienteModel.aggregate(pipeline);

    return cuentaCorriente[0];

  }

  // CC por proveedor
  async getPorProveedor(idProveedor: string): Promise<ICcProveedores> {

    const pipeline = [];

    // Cuenta corriente por proveedor
    const proveedor = new Types.ObjectId(idProveedor);
    pipeline.push({ $match: { proveedor } });

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }
    );

    pipeline.push({ $unwind: '$proveedor' });


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

    const cuentaCorriente = await this.cuentaCorrienteModel.aggregate(pipeline);

    return cuentaCorriente[0];

  }

  // Listar cuentas corrientes
  async getAll(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      activo,
      parametro,
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
    }

    // Informacion de proveedor
    pipeline.push({
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }
    );

    pipeline.push({ $unwind: '$proveedor' });

    
    // Informacion de proveedor - TOTAL
    pipelineTotal.push({
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }
    );

    pipelineTotal.push({ $unwind: '$proveedor' });

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
      pipeline.push({ $match: { $or: [ { 'proveedor.descripcion': regex } ] } });
      pipelineTotal.push({ $match: { $or: [ { 'proveedor.descripcion': regex } ] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    
    const [cuentas_corrientes, cuentasCorrientesTotal] = await Promise.all([
      this.cuentaCorrienteModel.aggregate(pipeline),
      this.cuentaCorrienteModel.aggregate(pipelineTotal),
    ])
    
    return {
      cuentas_corrientes,
      totalItems: cuentasCorrientesTotal.length
    };

  }

  // Crear cuenta corriente
  async insert(cuentaCorrienteDTO: CcProveedoresDTO): Promise<ICcProveedores> {

    // Verificacion: Si hay una cuenta corriente creada para el proveedor
    const cuenta_corriente = await this.cuentaCorrienteModel.findOne({ proveedor: cuentaCorrienteDTO.proveedor })
    if (cuenta_corriente) throw new NotFoundException('Este cliente ya tiene una cuenta corriente');

    const nuevaCuenta = new this.cuentaCorrienteModel(cuentaCorrienteDTO);
    return await nuevaCuenta.save();
  }

  // Actualizar cuenta corriente
  async update(id: string, cuentaCorrienteUpdateDTO: CcProveedoresDTO): Promise<ICcProveedores> {
    const cuentaCorriente = await this.cuentaCorrienteModel.findByIdAndUpdate(id, cuentaCorrienteUpdateDTO, { new: true });
    return cuentaCorriente;
  }

}
