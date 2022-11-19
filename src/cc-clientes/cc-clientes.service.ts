import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CcClientesUpdateDTO } from './dto/cc-clientes-update.dto';
import { CcClientesDTO } from './dto/cc-clientes.dto';
import { ICcClientes } from './interface/cc-clientes.interface';
import * as ExcelJs from 'exceljs';
import { add } from 'date-fns';
import * as path from 'path';

@Injectable()
export class CcClientesService {

  constructor(@InjectModel('CcClientes') private readonly cuentaCorrienteModel: Model<ICcClientes>) { };

  // CC por ID
  async getId(id: string): Promise<ICcClientes> {

    // Se verifica que la CC existe
    const cuentaCorrienteDB = await this.cuentaCorrienteModel.findById(id);
    if (!cuentaCorrienteDB) throw new NotFoundException('La cuenta corriente no existe');

    const pipeline = [];

    // Cuenta corriente por ID
    const idCuentaCorriente = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCuentaCorriente } })

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$cliente' });


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

  // CC por cliente
  async getPorCliente(idCliente: string): Promise<ICcClientes> {

    const pipeline = [];

    // Cuenta corriente por cliente
    const cliente = new Types.ObjectId(idCliente);
    pipeline.push({ $match: { cliente } });

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$cliente' });


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

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }
    );

    pipeline.push({ $unwind: '$cliente' });

    // Informacion de cliente - TOTAL
    pipelineTotal.push({
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }
    );

    pipelineTotal.push({ $unwind: '$cliente' });

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
      pipeline.push({ $match: { $or: [{ 'cliente.descripcion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ 'cliente.descripcion': regex }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

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
  async insert(cuentaCorrienteDTO: CcClientesDTO): Promise<ICcClientes> {

    // Verificacion: Si hay una cuenta corriente creada para el cliente
    const cuenta_corriente = await this.cuentaCorrienteModel.findOne({ cliente: cuentaCorrienteDTO.cliente })
    if (cuenta_corriente) throw new NotFoundException('Este cliente ya tiene una cuenta corriente');

    const nuevaCuenta = new this.cuentaCorrienteModel(cuentaCorrienteDTO);
    return await nuevaCuenta.save();
  }

  // Actualizar cuenta corriente
  async update(id: string, cuentaCorrienteUpdateDTO: CcClientesUpdateDTO): Promise<ICcClientes> {
    const cuentaCorriente = await this.cuentaCorrienteModel.findByIdAndUpdate(id, cuentaCorrienteUpdateDTO, { new: true });
    return cuentaCorriente;
  }

  // Reporte excel
  async generarExcel(): Promise<any> {

    // Obtener ventas
    const respuestas = await this.getAll({
      direccion: 1,
      columna: 'cliente.descripcion',
      desde: 0,
      registerpp: 1000000,
    });

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte - Cuentas corrientes');

    worksheet.addRow(['Cliente', 'Saldo', 'Fecha', 'Activa']);

    // Autofiltro
    worksheet.autoFilter = 'A1:D1';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true }
    });

    worksheet.getColumn(1).width = 40; // Cliente
    worksheet.getColumn(2).width = 17; // Saldo
    worksheet.getColumn(3).width = 17; // Fecha
    worksheet.getColumn(4).width = 15; // Estado

    // Agregar elementos
    respuestas.cuentas_corrientes.map(elemento => {
      worksheet.addRow([
        elemento.cliente.descripcion,
        Number(elemento.saldo),
        add(elemento.createdAt, { hours: -3 }),
        elemento.activo ? 'SI' : 'NO'
      ]);
    });

    // Generacion de reporte

    const nombreReporte = '../../public/excel/cuentas_corrientes.xlsx';
    workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then(async data => {
      const pathReporte = path.join(__dirname, nombreReporte);
    });

    // const fechaHoy = new Date();

    // worksheet.addRow(['Fecha'])

    return true;

  }


}
