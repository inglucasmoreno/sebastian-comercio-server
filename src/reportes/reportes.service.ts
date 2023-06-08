import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model } from 'mongoose';
import { ICompras } from 'src/compras/interface/compras.interface';
import { IVentasPropias } from 'src/ventas-propias/interface/ventas-propias.interface';
import { IVentas } from 'src/ventas/interface/ventas.interface';
import * as ExcelJs from 'exceljs';
import { IRecibosCobro } from 'src/recibos-cobro/interface/recibos-cobro.interface';
import { IOrdenesPago } from 'src/ordenes-pago/interface/ordenes-pago.interface';

@Injectable()
export class ReportesService {

  constructor(
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    @InjectModel('VentasPropias') private readonly ventasPropiasModel: Model<IVentasPropias>,
    @InjectModel('RecibosCobro') private readonly recibosCobroModel: Model<IRecibosCobro>,
    @InjectModel('OrdenesPago') private readonly ordenesPagoModel: Model<IOrdenesPago>,
  ) { };

  // REPORTES - EXCEL

  // Reportes -> Compras
  async comprasExcel({ fechaDesde, fechaHasta }): Promise<any> {

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
    const worksheet = workbook.addWorksheet('Reporte - Compras');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Número', 'Fecha de compra', 'Fecha de carga', 'Proveedor', 'Precio total', 'Habilitada', 'Cancelada']);

    // Autofiltro

    worksheet.autoFilter = 'A2:G2';

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

    // Agregar elementos
    compras.map(compra => {
      worksheet.addRow([
        compra.nro,
        add(compra.fecha_venta ? compra.fecha_venta : compra.createdAt, { hours: -3 }),
        add(compra.createdAt, { hours: -3 }),
        compra.proveedor['descripcion'],
        Number(compra.precio_total),
        compra.activo ? 'SI' : 'NO',
        compra.cancelada ? 'SI' : 'NO'
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Ventas
  async ventasExcel({ fechaDesde, fechaHasta }): Promise<any> {

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
    const worksheet = workbook.addWorksheet('Reporte - Ventas directas');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Número', 'Fecha de venta', 'Fecha de carga', 'Cliente', 'Precio total', 'Habilitada']);

    // Autofiltro

    worksheet.autoFilter = 'A2:F2';

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

    // Agregar elementos
    ventas.map(venta => {
      worksheet.addRow([
        venta.nro,
        add(venta.fecha_venta ? venta.fecha_venta : venta.createdAt, { hours: -3 }),
        add(venta.createdAt, { hours: -3 }),
        venta.cliente['descripcion'],
        Number(venta.precio_total),
        venta.activo ? 'SI' : 'NO',
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Ventas propias
  async ventasPropiasExcel({ fechaDesde, fechaHasta }): Promise<any> {

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
    const worksheet = workbook.addWorksheet('Reporte - Ventas propias');

    worksheet.addRow([
      'Desde:',
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), { hours: 3 }), 'dd-MM-yyyy') : 'Principio'}`,
      'Hasta:',
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), { hours: 3 }), 'dd-MM-yyyy') : 'Ahora'}`
    ]);

    worksheet.addRow(['Número', 'Fecha de venta', 'Fecha de carga', 'Cliente', 'Precio total', 'Habilitada', 'Cancelada']);

    // Autofiltro

    worksheet.autoFilter = 'A2:G2';

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

    // Agregar elementos
    ventas.map(venta => {
      worksheet.addRow([
        venta.nro,
        add(venta.fecha_venta ? venta.fecha_venta : venta.createdAt, { hours: -3 }),
        add(venta.createdAt, { hours: -3 }),
        venta.cliente['descripcion'],
        Number(venta.precio_total),
        venta.activo ? 'SI' : 'NO',
        venta.cancelada ? 'SI' : 'NO'
      ]);
    });

    return await workbook.xlsx.writeBuffer();

  }

  // Reportes -> Recibo de cobro
  async recibosCobroExcel({ fechaDesde, fechaHasta }): Promise<any> {

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
    const worksheet = workbook.addWorksheet('Reporte - Ventas propias');

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
    worksheet.getColumn(2).width = 20; // Fecha de venta
    worksheet.getColumn(3).width = 20; // Fecha de carga
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
  async ordenesPagoExcel({ fechaDesde, fechaHasta }): Promise<any> {

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
    const worksheet = workbook.addWorksheet('Reporte - Ordenes pago');

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


}
