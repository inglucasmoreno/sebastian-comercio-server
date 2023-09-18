import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICompras } from 'src/compras/interface/compras.interface';
import { IVentasPropias } from 'src/ventas-propias/interface/ventas-propias.interface';
import { IVentas } from 'src/ventas/interface/ventas.interface';
import * as ExcelJs from 'exceljs';
import { IRecibosCobro } from 'src/recibos-cobro/interface/recibos-cobro.interface';
import { IOrdenesPago } from 'src/ordenes-pago/interface/ordenes-pago.interface';
import { ICcClientes } from 'src/cc-clientes/interface/cc-clientes.interface';
import { ICcProveedores } from 'src/cc-proveedores/interface/cc-proveedores.interface';
import { ICcClientesMovimientos } from 'src/cc-clientes-movimientos/interface/cc-clientes-movimientos.interface';
import { ICcProveedoresMovimientos } from 'src/cc-proveedores-movimientos/interface/cc-proveedores-movimientos.interface';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';

@Injectable()
export class ReportesService {

  constructor(
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    @InjectModel('VentasPropias') private readonly ventasPropiasModel: Model<IVentasPropias>,
    @InjectModel('RecibosCobro') private readonly recibosCobroModel: Model<IRecibosCobro>,
    @InjectModel('OrdenesPago') private readonly ordenesPagoModel: Model<IOrdenesPago>,
    @InjectModel('CcClientes') private readonly cuentasCorrientesClientesModel: Model<ICcClientes>,
    @InjectModel('CcProveedores') private readonly cuentasCorrientesProveedoresModel: Model<ICcProveedores>,
    @InjectModel('CcClientesMovimientos') private readonly clientesMovimientosModel: Model<ICcClientesMovimientos>,
    @InjectModel('CcProveedoresMovimientos') private readonly proveedoresMovimientosModel: Model<ICcProveedoresMovimientos>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
  ) { };

  // REPORTES - EXCEL

  // Reportes -> Compras
  async comprasExcel({
    fechaDesde,
    fechaHasta,
    activas
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionProveedor = {
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }

    // Filtro ventas activas/inactivas
    if (activas && activas !== '') {
      pipeline.push({
        $match: { activo: activas === 'true' ? true : false }
      });
    }

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_compra: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_compra: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    pipeline.push(condicionProveedor);
    pipeline.push({ $unwind: '$proveedor' });

    const compras = await this.comprasModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow([
      'Número',
      'Fecha de compra',
      'Fecha de carga',
      'Proveedor',
      'Precio total',
      'Habilitada',
      'Cancelada',
      'Observaciones',
      'Número de factura'
    ]);

    // Autofiltro

    worksheet.autoFilter = 'A2:I2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 14; // Codigo
    worksheet.getColumn(2).width = 20; // Fecha de compra
    worksheet.getColumn(3).width = 20; // Fecha de carga
    worksheet.getColumn(4).width = 40; // Proveedor
    worksheet.getColumn(5).width = 25; // Precio total
    worksheet.getColumn(6).width = 15; // Habilitadas
    worksheet.getColumn(7).width = 16; // Canceladas
    worksheet.getColumn(8).width = 40; // Observaciones
    worksheet.getColumn(9).width = 25; // Numero de factura

    // Agregar elementos
    compras.map(compra => {
      worksheet.addRow([
        compra.nro,
        add(compra.fecha_venta ? compra.fecha_venta : compra.createdAt, { hours: -3 }),
        add(compra.createdAt, { hours: -3 }),
        compra.proveedor['descripcion'],
        Number(compra.precio_total),
        compra.activo ? 'SI' : 'NO',
        compra.cancelada ? 'SI' : 'NO',
        compra.observacion,
        compra.nro_factura
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Ventas
  async ventasExcel({
    fechaDesde = '',
    fechaHasta = '',
    activas = 'true'
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionCliente = {
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }

    pipeline.push(condicionCliente);
    pipeline.push({ $unwind: '$cliente' });

    // Filtro ventas activas/inactivas
    if (activas && activas !== '') {
      pipeline.push({
        $match: { activo: activas === 'true' ? true : false }
      });
    }

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_venta: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_venta: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    const ventas = await this.ventasModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow([
      'Número',
      'Fecha de venta',
      'Fecha de carga',
      'Cliente',
      'Precio total',
      'Habilitada',
      'Nro de factura',
      'observaciones'
    ]);

    // Autofiltro

    worksheet.autoFilter = 'A2:H2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 14; // Codigo
    worksheet.getColumn(2).width = 20; // Fecha de venta
    worksheet.getColumn(3).width = 20; // Fecha de carga
    worksheet.getColumn(4).width = 40; // Cliente
    worksheet.getColumn(5).width = 25; // Precio total
    worksheet.getColumn(6).width = 15; // Habilitadas
    worksheet.getColumn(7).width = 20; // Nro de factura
    worksheet.getColumn(8).width = 40; // Observaciones

    // Agregar elementos
    ventas.map(venta => {
      worksheet.addRow([
        venta.nro,
        add(venta.fecha_venta ? venta.fecha_venta : venta.createdAt, { hours: -3 }),
        add(venta.createdAt, { hours: -3 }),
        venta.cliente['descripcion'],
        Number(venta.precio_total),
        venta.activo ? 'SI' : 'NO',
        venta.nro_factura,
        venta.observacion
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Ventas propias
  async ventasPropiasExcel({
    fechaDesde,
    fechaHasta,
    activas
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionCliente = {
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }

    pipeline.push(condicionCliente);
    pipeline.push({ $unwind: '$cliente' });

    // Filtro ventas activas/inactivas
    if (activas && activas !== '') {
      pipeline.push({
        $match: { activo: activas === 'true' ? true : false }
      });
    }

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_venta: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_venta: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    const ventas = await this.ventasPropiasModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow([
      'Número',
      'Fecha de venta',
      'Fecha de carga',
      'Cliente',
      'Precio total',
      'Habilitada',
      'Cancelada',
      'Observaciones',
    ]);

    // Autofiltro

    worksheet.autoFilter = 'A2:H2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 14; // Codigo
    worksheet.getColumn(2).width = 20; // Fecha de venta
    worksheet.getColumn(3).width = 20; // Fecha de carga
    worksheet.getColumn(4).width = 40; // Cliente
    worksheet.getColumn(5).width = 25; // Precio total
    worksheet.getColumn(6).width = 20; // Habilitadas
    worksheet.getColumn(7).width = 20; // Canceladas
    worksheet.getColumn(8).width = 20; // Observaciones

    // Agregar elementos
    ventas.map(venta => {
      worksheet.addRow([
        venta.nro,
        add(venta.fecha_venta ? venta.fecha_venta : venta.createdAt, { hours: -3 }),
        add(venta.createdAt, { hours: -3 }),
        venta.cliente['descripcion'],
        Number(venta.precio_total),
        venta.activo ? 'SI' : 'NO',
        venta.cancelada ? 'SI' : 'NO',
        venta.observacion
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Recibo de cobro
  async recibosCobroExcel({
    fechaDesde = '',
    fechaHasta = ''
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionCliente = {
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }

    pipeline.push(condicionCliente);
    pipeline.push({ $unwind: '$cliente' });

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_cobro: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_cobro: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    const recibos = await this.recibosCobroModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Número', 'Fecha de cobro', 'Fecha de carga', 'Cliente', 'Cobro total']);

    // Autofiltro

    worksheet.autoFilter = 'A2:E2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 14; // Codigo
    worksheet.getColumn(2).width = 25; // Fecha de venta
    worksheet.getColumn(3).width = 25; // Fecha de carga
    worksheet.getColumn(4).width = 40; // Cliente
    worksheet.getColumn(5).width = 25; // Precio total
    worksheet.getColumn(6).width = 15; // Habilitadas

    // Agregar elementos
    recibos.map(recibo => {
      worksheet.addRow([
        recibo.nro,
        add(recibo.fecha_compra ? recibo.fecha_compra : recibo.createdAt, { hours: -3 }),
        add(recibo.createdAt, { hours: -3 }),
        recibo.cliente['descripcion'],
        Number(recibo.cobro_total),
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Ordenes de pago
  async ordenesPagoExcel({
    fechaDesde = '',
    fechaHasta = ''
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionProveedor = {
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }

    pipeline.push(condicionProveedor);
    pipeline.push({ $unwind: '$proveedor' });

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pago: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          fecha_pago: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    const ordenes = await this.ordenesPagoModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Número', 'Fecha de pago', 'Fecha de carga', 'Proveedor', 'Pago total']);

    // Autofiltro

    worksheet.autoFilter = 'A2:E2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 14; // Codigo
    worksheet.getColumn(2).width = 20; // Fecha de pago
    worksheet.getColumn(3).width = 20; // Fecha de carga
    worksheet.getColumn(4).width = 40; // Cliente
    worksheet.getColumn(5).width = 25; // Precio total

    // Agregar elementos
    ordenes.map(orden => {
      worksheet.addRow([
        orden.nro,
        add(orden.fecha_pago ? orden.fecha_pago : orden.createdAt, { hours: -3 }),
        add(orden.createdAt, { hours: -3 }),
        orden.proveedor['descripcion'],
        Number(orden.pago_total),
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Cuenta corriente de clientes
  async cuentasCorrientesClientesExcel({
    fechaDesde = '',
    fechaHasta = '',
    activas = 'true'
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionCliente = {
      $lookup: { // Lookup
        from: 'clientes',
        localField: 'cliente',
        foreignField: '_id',
        as: 'cliente'
      }
    }

    // Filtro cuentas corrientes activas/inactivas
    if (activas && activas !== '') {
      pipeline.push({
        $match: { activo: activas === 'true' ? true : false }
      });
    }

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    pipeline.push(condicionCliente);
    pipeline.push({ $unwind: '$cliente' });

    const cuentasCorrientes = await this.cuentasCorrientesClientesModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Cliente', 'Saldo', 'Fecha de creación', 'Estado']);

    // Autofiltro

    worksheet.autoFilter = 'A2:D2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 40; // Cliente
    worksheet.getColumn(2).width = 20; // Saldo
    worksheet.getColumn(3).width = 20; // Fecha de creacion
    worksheet.getColumn(4).width = 20; // Estado

    // Agregar elementos
    cuentasCorrientes.map(cuentaCorriente => {
      worksheet.addRow([
        cuentaCorriente.cliente['descripcion'],
        cuentaCorriente.saldo,
        add(cuentaCorriente.createdAt, { hours: -3 }),
        cuentaCorriente.activo ? 'Activa' : 'Inactiva',
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Cuenta corriente de proveedor
  async cuentasCorrientesProveedoresExcel({
    fechaDesde = '',
    fechaHasta = '',
    activas = 'true'
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    const condicionProveedor = {
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }

    // Filtro ventas activas/inactivas
    if (activas && activas !== '') {
      pipeline.push({
        $match: { activo: activas === 'true' ? true : false }
      });
    }

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    pipeline.push(condicionProveedor);
    pipeline.push({ $unwind: '$proveedor' });

    const cuentasCorrientes = await this.cuentasCorrientesProveedoresModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte - CC de proveedores');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Proveedor', 'Saldo', 'Fecha de creación', 'Estado']);

    // Autofiltro

    worksheet.autoFilter = 'A2:D2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 40; // Proveedor
    worksheet.getColumn(2).width = 20; // Saldo
    worksheet.getColumn(3).width = 20; // Fecha de creacion
    worksheet.getColumn(4).width = 20; // Estado

    // Agregar elementos
    cuentasCorrientes.map(cuentaCorriente => {
      worksheet.addRow([
        cuentaCorriente.proveedor['descripcion'],
        cuentaCorriente.saldo,
        add(cuentaCorriente.createdAt, { hours: -3 }),
        cuentaCorriente.activo ? 'Activa' : 'Inactiva',
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Movimientos clientes
  async movimientosClientesExcel({
    fechaDesde = '',
    fechaHasta = '',
    cliente = ''
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];

    // Cliente por ID
    const idCliente = new Types.ObjectId(cliente);
    pipeline.push({ $match: { cliente: idCliente } });

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    // Ordenando datos
    pipeline.push({ $sort: { createdAt: -1 } });

    const movimientos = await this.clientesMovimientosModel.aggregate(pipeline);

    let movimientosReporte = [];

    // Se agrega la fecha de recibo de cobro
    for (const elemento of movimientos) {
      
      let nuevoElemento = elemento;
      
      if (elemento.recibo_cobro !== '') {
        const reciboCobro = await this.recibosCobroModel.findById(elemento.recibo_cobro);
        nuevoElemento.fecha_comprobante = reciboCobro.fecha_cobro ? reciboCobro.fecha_cobro : reciboCobro.createdAt;
        movimientosReporte.push(nuevoElemento);
      }else if(elemento.venta_propia !== '') {
        const ventaPropia = await this.ventasPropiasModel.findById(elemento.venta_propia);
        nuevoElemento.fecha_comprobante = ventaPropia.fecha_venta ? ventaPropia.fecha_venta : ventaPropia.createdAt;
        movimientosReporte.push(nuevoElemento);
      }else {
        nuevoElemento.fecha_comprobante = '';
        movimientosReporte.push(nuevoElemento);
      }    
    }
    
    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Fecha de creación', 'Fecha de comprobante', 'Número', 'Descripción', 'Debe', 'Haber', 'Saldo']);

    // Autofiltro

    worksheet.autoFilter = 'A2:F2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 25; // Fecha creacion
    worksheet.getColumn(2).width = 25; // Fecha de comprobante
    worksheet.getColumn(4).width = 16; // Numero
    worksheet.getColumn(5).width = 40; // Descripcion
    worksheet.getColumn(6).width = 20; // Debe
    worksheet.getColumn(7).width = 20; // Haber
    worksheet.getColumn(8).width = 20; // Saldo

    // Agregar elementos
    movimientosReporte.map(movimiento => {
      worksheet.addRow([
        add(movimiento.createdAt, { hours: -3 }),
        movimiento.fecha_comprobante !== '' ? add(movimiento.fecha_comprobante, { hours: -3 }) : '',
        movimiento.nro,
        movimiento.descripcion,
        movimiento.tipo === 'Debe' ? movimiento.monto : '',
        movimiento.tipo === 'Haber' ? movimiento.monto : '',
        movimiento.saldo_nuevo,
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Movimientos proveedores
  async movimientosProveedoresExcel({
    fechaDesde = '',
    fechaHasta = '',
    proveedor = ''
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];

    // Proveedor por ID
    const idProveedor = new Types.ObjectId(proveedor);
    pipeline.push({ $match: { proveedor: idProveedor } });

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    // Ordenando datos
    pipeline.push({ $sort: { createdAt: -1 } });

    const movimientos = await this.proveedoresMovimientosModel.aggregate(pipeline);

    let movimientosReporte = [];

    // Se agrega la fecha de comprobante
    for (const elemento of movimientos) {
      let nuevoElemento = elemento;
      if (elemento.orden_pago !== '') {
        const ordenPago = await this.ordenesPagoModel.findById(elemento.orden_pago);
        nuevoElemento.fecha_comprobante = ordenPago.fecha_pago ? ordenPago.fecha_pago : ordenPago.createdAt;
        movimientosReporte.push(nuevoElemento);
      }else if (elemento.compra !== '') {
        const compra = await this.comprasModel.findById(elemento.compra);
        nuevoElemento.fecha_comprobante = compra.fecha_compra ? compra.fecha_compra : compra.createdAt;
        movimientosReporte.push(nuevoElemento);
      }else {
        nuevoElemento.fecha_comprobante = '';
        movimientosReporte.push(nuevoElemento);
      }
    }

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Fecha de creación', 'Fecha de comprobante', 'Número', 'Descripción', 'Debe', 'Haber', 'Saldo']);

    // Autofiltro

    worksheet.autoFilter = 'A2:F2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 25; // Fecha creacion
    worksheet.getColumn(2).width = 25; // Fecha de comprobante
    worksheet.getColumn(3).width = 20; // Numero
    worksheet.getColumn(4).width = 30; // Descripcion
    worksheet.getColumn(5).width = 20; // Debe
    worksheet.getColumn(6).width = 20; // Haber
    worksheet.getColumn(7).width = 20; // Saldo

    // Agregar elementos
    movimientosReporte.map(movimiento => {
      worksheet.addRow([
        add(movimiento.createdAt, { hours: -3 }),
        movimiento.fecha_comprobante !== '' ? add(movimiento.fecha_comprobante, { hours: -3 }) : '',
        movimiento.nro,
        movimiento.descripcion,
        movimiento.tipo === 'Debe' ? movimiento.monto : '',
        movimiento.tipo === 'Haber' ? movimiento.monto : '',
        movimiento.saldo_nuevo,
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Movimientos cajas
  async movimientosCajasExcel({
    fechaDesde = '',
    fechaHasta = '',
    caja = ''
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];

    // Caja por ID
    const idCaja = new Types.ObjectId(caja);
    pipeline.push({ $match: { caja: idCaja } });

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    // Ordenando datos
    pipeline.push({ $sort: { createdAt: -1 } });

    const movimientos = await this.cajasMovimientosModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Fecha de creación', 'Número', 'Descripción', 'Debe', 'Haber', 'Saldo']);

    // Autofiltro

    worksheet.autoFilter = 'A2:F2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 20; // Fecha creacion
    worksheet.getColumn(2).width = 16; // Numero
    worksheet.getColumn(3).width = 40; // Descripcion
    worksheet.getColumn(4).width = 20; // Debe
    worksheet.getColumn(5).width = 20; // Haber
    worksheet.getColumn(6).width = 20; // Saldo

    // Agregar elementos
    movimientos.map(movimiento => {
      worksheet.addRow([
        add(movimiento.createdAt, { hours: -3 }),
        movimiento.nro,
        movimiento.descripcion,
        movimiento.tipo === 'Debe' ? movimiento.monto : '',
        movimiento.tipo === 'Haber' ? movimiento.monto : '',
        movimiento.saldo_nuevo,
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Cajas
  async cajasExcel({
    fechaDesde = '',
    fechaHasta = '',
    activas = 'true'
  }): Promise<any> {

    // OBTENCION DE DATOS

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Filtro ventas activas/inactivas
    if (activas && activas !== '') {
      pipeline.push({
        $match: { activo: activas === 'true' ? true : false }
      });
    }

    // Filtro por fechas [ Desde -> Hasta ]

    if (fechaDesde && fechaDesde.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $gte: add(new Date(fechaDesde), { hours: 3 }) }
        }
      });
    }

    if (fechaHasta && fechaHasta.trim() !== '') {
      pipeline.push({
        $match: {
          createdAt: { $lte: add(new Date(fechaHasta), { days: 1, hours: 3 }) }
        }
      });
    }

    const cajas = await this.cajasModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Caja', 'Saldo', 'Fecha de creación', 'Estado']);

    // Autofiltro

    worksheet.autoFilter = 'A2:D2';

    // Estilo de filas y columnas

    worksheet.getRow(1).height = 20;
    worksheet.getRow(2).height = 20;

    worksheet.getRow(1).eachCell(cell => { cell.font = { bold: true } });
    worksheet.getRow(2).eachCell(cell => { cell.font = { bold: true } });

    worksheet.getColumn(1).width = 40; // Caja
    worksheet.getColumn(2).width = 20; // Saldo
    worksheet.getColumn(3).width = 20; // Fecha de creacion
    worksheet.getColumn(4).width = 20; // Estado

    // Agregar elementos
    cajas.map(caja => {
      worksheet.addRow([
        caja.descripcion,
        caja.saldo,
        add(caja.createdAt, { hours: -3 }),
        caja.activo ? 'Activa' : 'Inactiva',
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

}
