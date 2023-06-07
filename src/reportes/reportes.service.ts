import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model } from 'mongoose';
import { ICompras } from 'src/compras/interface/compras.interface';
import { IVentasPropias } from 'src/ventas-propias/interface/ventas-propias.interface';
import { IVentas } from 'src/ventas/interface/ventas.interface';
import * as ExcelJs from 'exceljs';

@Injectable()
export class ReportesService {

  constructor(
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    // @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    // @InjectModel('VentasPropias') private readonly ventasPropiasModel: Model<IVentasPropias>,
  ) { };

  // REPORTES - EXCEL

  // Reportes -> Compras
  async comprasExcel(data: any): Promise<any> {

    const { fechaDesde, fechaHasta } = data;

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

    if(fechaDesde && fechaDesde.trim() !== ''){
      pipeline.push({$match: { 
        fecha_compra: { $gte: add(new Date(fechaDesde),{ hours: 3 })} 
      }});    
    }

    if(fechaHasta && fechaHasta.trim() !== ''){
      pipeline.push({$match: { 
        fecha_compra: { $lte: add(new Date(fechaHasta),{ days: 1, hours: 3 })} 
      }});
    }

    pipeline.push(condicionProveedor);
    pipeline.push({ $unwind: '$proveedor' });

    const compras = await this.comprasModel.aggregate(pipeline);

    // GENERACION EXCEL

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Reporte - Compras');

    worksheet.addRow([
      'Desde:', 
      `${fechaDesde && fechaDesde.trim() !== '' ? format(add(new Date(fechaDesde), {hours: 3}), 'dd-MM-yyyy') : 'Principio'}`, 
      'Hasta:', 
      `${fechaHasta && fechaHasta.trim() !== '' ? format(add(new Date(fechaHasta), {hours: 3}), 'dd-MM-yyyy') : 'Ahora'}`
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

}
