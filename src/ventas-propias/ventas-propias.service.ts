import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IClientes } from 'src/clientes/interface/clientes.interface';
import { IVentasPropiasProductos } from 'src/ventas-propias-productos/interface/ventas-propias-productos.interface';
import { VentasPropiasDTO } from './dto/ventas-propias.dto';
import { IVentasPropias } from './interface/ventas-propias.interface';
import * as ExcelJs from 'exceljs';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { add, format } from 'date-fns';
import * as path from 'path';
import { ICcClientes } from 'src/cc-clientes/interface/cc-clientes.interface';
import { ICheques } from 'src/cheques/interface/cheques.interface';
import { IVentasPropiasCheques } from 'src/ventas-propias-cheques/interface/ventas-propias-cheques.interface';
import { ICcClientesMovimientos } from 'src/cc-clientes-movimientos/interface/cc-clientes-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';

@Injectable()
export class VentasPropiasService {

    proveedoresModel: any;

    constructor(
        @InjectModel('VentasPropias') private readonly ventasModel: Model<IVentasPropias>,
        @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
        @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
        @InjectModel('VentasPropiasCheques') private readonly ventasPropiasChequesModel: Model<IVentasPropiasCheques>,
        @InjectModel('CcClientes') private readonly ccClientesModel: Model<ICcClientes>,
        @InjectModel('CcClientesMovimientos') private readonly ccClientesMovimientosModel: Model<ICcClientesMovimientos>,
        @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
        @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
        @InjectModel('VentasPropiasProductos') private readonly ventaProductosModel: Model<IVentasPropiasProductos>,
    ) { };

    // Funcion para redondeo
    redondear(numero: number, decimales: number): number {

        if (typeof numero != 'number' || typeof decimales != 'number') return null;

        let signo = numero >= 0 ? 1 : -1;

        return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

    }

    // Venta propia por ID
    async getId(id: string): Promise<IVentasPropias> {

        // Se verifica si la venta existe
        const ventaDB = await this.ventasModel.findById(id);
        if (!ventaDB) throw new NotFoundException('La venta no existe');

        const pipeline = [];

        // Venta por ID
        const idVenta = new Types.ObjectId(id);
        pipeline.push({ $match: { _id: idVenta } });

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

        const venta = await this.ventasModel.aggregate(pipeline);

        return venta[0];

    }

    // Listar ventas
    async getAll(querys: any): Promise<IVentasPropias[]> {

        const { columna, direccion, cliente, cancelada } = querys;

        const pipeline = [];
        pipeline.push({ $match: {} });

        // Filtrado por cliente
        if (cliente && cliente !== '') {
            const idCliente = new Types.ObjectId(cliente);
            pipeline.push({ $match:{ cliente: idCliente} });
        } 

        // Filtro por venta cancelada
        let filtroCancelada = {};
        if (cancelada && cancelada !== '') {
            filtroCancelada = { cancelada: cancelada === 'true' ? true : false };
            pipeline.push({ $match: filtroCancelada });
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

        const ventas = await this.ventasModel.aggregate(pipeline);

        return ventas;

    }

    // Crear venta
    async insert(ventasDTO: VentasPropiasDTO): Promise<any> {

        let {
            tipo_venta,
            cliente,
            formas_pago,
            cheques,
            cancelada,
            deuda_monto,
            cliente_descripcion,
            cliente_identificacion,
            cliente_tipo_identificacion,
            cliente_correo_electronico,
            cliente_condicion_iva,
            observacion,
            precio_total,
            productos,
            creatorUser,
            updatorUser
        } = ventasDTO;

        // SECCION CLIENTE

        if (cliente.trim() === '' && cliente.trim() !== '000000000000000000000000') {

            const clienteDB: any = await this.clientesModel.findOne({ identificacion: cliente_identificacion });

            if (!clienteDB) { // El cliente no existe en la BD -> SE CREA

                const nuevoCliente = new this.clientesModel({
                    descripcion: cliente_descripcion,
                    tipo_identificacion: cliente_tipo_identificacion,
                    identificacion: cliente_identificacion,
                    direccion: cliente_descripcion,
                    correo_electronico: cliente_correo_electronico,
                    condicion_iva: cliente_condicion_iva,
                    creatorUser,
                    updatorUser
                });

                const clienteRes = await nuevoCliente.save();
                cliente = clienteRes._id;

            } else { // El identificador esta registrado -> Se corrige      
                cliente = clienteDB._id;
                cliente_descripcion = clienteDB.descripcion;
                cliente_identificacion = clienteDB.identificacion;
                cliente_tipo_identificacion = clienteDB.tipo_identificacion;
                condicion_iva: clienteDB.condicion_iva;
            }
        }

        // NRO DE VENTA

        let nroVenta: number = 0;

        const ventas = await this.ventasModel.find()
            .sort({ createdAt: -1 })
            .limit(1)

        ventas.length === 0 ? nroVenta = 1 : nroVenta = Number(ventas[0].nro + 1);

        // GENERACION DE VENTA

        // Datos de venta
        const dataVenta = {
            nro: nroVenta,
            tipo: tipo_venta,
            cliente,
            precio_total: this.redondear(precio_total, 2),
            observacion,
            formas_pago,
            cancelada,
            deuda_monto: this.redondear(deuda_monto, 2),
            // descripcion,
            // tipo_identificacion,
            // identificacion,
            // direccion,
            // telefono,
            // correo_electronico,
            // condicion_iva,
            creatorUser,
            updatorUser
        };

        // IMPACTOS - Cuenta corriente

        let decrementoCC = false;
        let montoDecremento = 0;

        let totalPagado = 0;
        let totalEnCheques = 0;

        // Se recorren las formas de pago
        formas_pago.map((forma: any) => {

            // Deteccion: Pago con cuenta corriente
            if (forma.descripcion === 'CUENTA CORRIENTE') {
                decrementoCC = true;
                montoDecremento = forma.monto;
            }

            // Calculo de pago total
            totalPagado += forma.monto;

        });

        // Se recorren los cheques
        cheques.map((cheque: any) => {

            // Calcular el pago total
            totalPagado += cheque.importe;

            // Calcular el monto total en cheques
            totalEnCheques += cheque.importe;

        });

        // CREACION DE VENTA
        const nuevaVenta = new this.ventasModel({ ...dataVenta, pago_monto: totalPagado });
        const ventaDB = await nuevaVenta.save();

        // Adaptando numero
        let codigoVenta: string;
        if (ventaDB.nro <= 9) codigoVenta = 'VP000000' + String(ventaDB.nro);
        else if (ventaDB.nro <= 99) codigoVenta = 'VP00000' + String(ventaDB.nro);
        else if (ventaDB.nro <= 999) codigoVenta = 'VP0000' + String(ventaDB.nro);
        else if (ventaDB.nro <= 9999) codigoVenta = 'VP000' + String(ventaDB.nro);
        else if (ventaDB.nro <= 99999) codigoVenta = 'VP00' + String(ventaDB.nro);
        else if (ventaDB.nro <= 999999) codigoVenta = 'VP0' + String(ventaDB.nro);

        // IMPACTO - MOVIMIENTOS CUENTA CORRIENTE DE CLIENTE

        // (-) Decremento en cuenta corriente de cliente
        if (decrementoCC) {
            const cuentaCorrienteDB: any = await this.ccClientesModel.findOne({ cliente });
            if (cuentaCorrienteDB) {
                await this.ccClientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: cuentaCorrienteDB.saldo - montoDecremento });

                // Creacion de movimiento
                const dataMovimiento = {
                    descripcion: `VENTA ${codigoVenta} - PAGO`,
                    tipo: 'Haber',
                    cc_cliente: String(cuentaCorrienteDB._id),
                    cliente,
                    venta_propia: String(ventaDB._id),
                    monto: this.redondear(montoDecremento, 2),
                    saldo_anterior: this.redondear(cuentaCorrienteDB.saldo, 2),
                    saldo_nuevo: this.redondear(cuentaCorrienteDB.saldo - montoDecremento, 2),
                    creatorUser,
                    updatorUser
                }

                const nuevoMovimiento = new this.ccClientesMovimientosModel(dataMovimiento);
                await nuevoMovimiento.save();

            }

        }

        // (+) Incremento en cuenta corriente de cliente
        if (totalPagado > precio_total) {
            const cuentaCorrienteDB: any = await this.ccClientesModel.findOne({ cliente });
            if (cuentaCorrienteDB) {

                const montoIncremento = totalPagado - precio_total;

                await this.ccClientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: cuentaCorrienteDB.saldo + montoIncremento });

                // Creacion de movimiento
                const dataMovimiento = {
                    descripcion: `VENTA ${codigoVenta} - SALDO A FAVOR`,
                    tipo: 'Debe',
                    cc_cliente: String(cuentaCorrienteDB._id),
                    cliente,
                    venta_propia: String(ventaDB._id),
                    monto: this.redondear(montoIncremento, 2),
                    saldo_anterior: this.redondear(cuentaCorrienteDB.saldo, 2),
                    saldo_nuevo: this.redondear(cuentaCorrienteDB.saldo + montoIncremento, 2),
                    creatorUser,
                    updatorUser
                }

                const nuevoMovimiento = new this.ccClientesMovimientosModel(dataMovimiento);
                await nuevoMovimiento.save();
            }

        }

        // IMPACTO - EN CAJAS
        formas_pago.map(async (forma_pago: any) => {

            if (forma_pago._id !== 'cuenta_corriente') {

                // Impaco en movimiento de cajas

                const cajaDB = await this.cajasModel.findById(forma_pago._id);

                const data = {
                    descripcion: `VENTA ${codigoVenta}`,
                    tipo: 'Debe',
                    caja: forma_pago._id,
                    venta_propia: String(ventaDB._id),
                    monto: this.redondear(forma_pago.monto, 2),
                    saldo_anterior: this.redondear(cajaDB.saldo, 2),
                    saldo_nuevo: this.redondear(cajaDB.saldo + forma_pago.monto, 2),
                    creatorUser,
                    updatorUser
                };

                const nuevoMovimiento = new this.cajasMovimientosModel(data);
                await nuevoMovimiento.save();

                // Impacto en saldo de caja
                await this.cajasModel.findByIdAndUpdate(forma_pago._id, { $inc: { saldo: forma_pago.monto } });

            }

        });

        // IMPACTO - EN SALDOS DE CHEQUES    
        if (totalEnCheques > 0) {

            const cajaCheques = await this.cajasModel.findById('222222222222222222222222');

            // Impacto en movimientos de cajas
            const data = {
                descripcion: `VENTA ${codigoVenta}`,
                tipo: 'Debe',
                caja: '222222222222222222222222',
                venta_propia: String(ventaDB._id),
                monto: this.redondear(totalEnCheques, 2),
                saldo_anterior: this.redondear(cajaCheques.saldo, 2),
                saldo_nuevo: this.redondear(cajaCheques.saldo + totalEnCheques, 2),
                creatorUser,
                updatorUser
            };

            const nuevoMovimiento = new this.cajasMovimientosModel(data);
            await nuevoMovimiento.save();

            // Impacto en saldo de cheques
            await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { $inc: { saldo: totalEnCheques } });
        }

        // GENERACION DE CHEQUES

        // Adaptando fechas
        cheques.map((cheque: any) => {
            cheque.fecha_cobro = add(new Date(cheque.fecha_cobro), { hours: 3 });
        });

        // Generando cheques
        const chequesDB = await this.chequesModel.insertMany(cheques);

        // GENERACION DE RELACION -> VENTA - CHEQUE
        const relaciones = [];

        chequesDB.map((cheque: any) => {
            relaciones.unshift({
                cheque: String(cheque._id),
                venta_propia: String(ventaDB._id),
                creatorUser,
                updatorUser
            })
        });

        await this.ventasPropiasChequesModel.insertMany(relaciones);

        // CARGA DE PRODUCTOS
        let productosVenta: any = productos;
        productosVenta.map(producto => producto.venta_propia = String(ventaDB._id))

        await this.ventaProductosModel.insertMany(productosVenta);

        // GENERACION DE PDF

        const venta = await this.getId(ventaDB._id);

        let html: any;

        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/venta-propia.html', 'utf-8');

        var options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            footer: {
                height: "35mm",
                contents: {
                    first: `
                    <p style="width: 100%; font-size: 9px; padding-bottom: 7px; padding:10px; border-top: 1px solid black; text-align:right; margin-bottom: 10px;"> <b style="background-color:#ECECEC; padding:10px; border-top: 1px solid black;"> Precio total: </b> <span style="background-color:#ECECEC; padding: 10px; border-top: 1px solid black;"> $${Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ventaDB.precio_total)} </span> </p>
                    <p style="width: 100%; font-size: 8px; padding-bottom: 7px;"> <b> Observaciones </b> </p>
                    <p style="width: 100%; font-size: 8px;"> ${ventaDB.observacion} </p>
                `,
                    2: 'Second page',
                    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
                    last: 'Last Page'
                }
            }
        }

        let productosPDF: any[] = [];
        const productosMap: any = productos;

        // Adaptando productos
        productosMap.map(producto => productosPDF.push({
            descripcion: producto.descripcion,
            cantidad: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.cantidad),
            unidad_medida: producto.unidad_medida,
            precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
            precio_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_total)
        }));

        // Adaptando numero
        let mostrarNumero: string;
        const { nro } = ventaDB;
        if (nro <= 9) mostrarNumero = 'VP000000' + String(nro);
        else if (nro <= 99) mostrarNumero = 'VP00000' + String(nro);
        else if (nro <= 999) mostrarNumero = 'VP0000' + String(nro);
        else if (nro <= 9999) mostrarNumero = 'VP000' + String(nro);
        else if (nro <= 99999) mostrarNumero = 'VP00' + String(nro);
        else if (nro <= 999999) mostrarNumero = 'VP0' + String(nro);

        const data = {
            fecha: format(venta.createdAt, 'dd/MM/yyyy'),
            numero: mostrarNumero,
            descripcion: venta.cliente['descripcion'],
            correo_electronico: venta.cliente['correo_electronico'],
            condicion_iva: venta.cliente['condicion_iva'],
            direccion: venta.cliente['direccion'],
            telefono: venta.cliente['telefono'],
            productos: productosPDF,
            total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(venta.precio_total)
        };

        // Configuraciones de documento
        var document = {
            html: html,
            data,
            path: (process.env.PUBLIC_DIR || './public') + '/pdf/venta-propia.pdf'
        }

        // Generacion de PDF
        await pdf.create(document, options);

        return 'Venta creada correctamente';

    }

    // Actualizar venta
    async update(id: string, ventasUpdateDTO: any): Promise<IVentasPropias> {

        const ventaDB = await this.ventasModel.findById(id);

        // Verificacion: La venta no existe
        if (!ventaDB) throw new NotFoundException('La venta no existe');

        const venta = await this.ventasModel.findByIdAndUpdate(id, ventasUpdateDTO, { new: true });
        return venta;

    }

    // Generar PDF
    async generarPDF(dataFront: any): Promise<any> {

        // Promisa ALL
        const [venta, productos] = await Promise.all([
            this.getId(dataFront.venta),
            this.ventaProductosModel.find({ venta_propia: dataFront.venta })
        ]);

        //   const venta = await this.getId(dataFront.venta);
        //   const productos = await this.ventaProductosModel.find({ venta: dataFront.venta });

        let html: any;

        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/venta-propia.html', 'utf-8');

        let productosPDF: any[] = [];

        // Adaptando productos
        productos.map(producto => productosPDF.push({
            descripcion: producto.descripcion,
            cantidad: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.cantidad),
            unidad_medida: producto.unidad_medida,
            precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
            precio_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_total)
        }));

        // Adaptando numero
        let mostrarNumero: string;
        const { nro } = venta;
        if (nro <= 9) mostrarNumero = 'VP000000' + String(nro);
        else if (nro <= 99) mostrarNumero = 'VP00000' + String(nro);
        else if (nro <= 999) mostrarNumero = 'VP0000' + String(nro);
        else if (nro <= 9999) mostrarNumero = 'VP000' + String(nro);
        else if (nro <= 99999) mostrarNumero = 'VP00' + String(nro);
        else if (nro <= 999999) mostrarNumero = 'VP0' + String(nro);

        const data = {
            fecha: format(venta.createdAt, 'dd/MM/yyyy'),
            numero: mostrarNumero,
            descripcion: venta.cliente['descripcion'],
            correo_electronico: venta.cliente['correo_electronico'],
            condicion_iva: venta.cliente['condicion_iva'],
            direccion: venta.cliente['direccion'],
            telefono: venta.cliente['telefono'],
            productos: productosPDF,
            total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(venta.precio_total)
        };

        var options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            footer: {
                height: "35mm",
                contents: {
                    first: `
                      <p style="width: 100%; font-size: 9px; padding-bottom: 7px; padding:10px; border-top: 1px solid black; text-align:right; margin-bottom: 10px;"> <b style="background-color:#ECECEC; padding:10px; border-top: 1px solid black;"> Precio total: </b> <span style="background-color:#ECECEC; padding: 10px; border-top: 1px solid black;"> $${data.total} </span> </p>
                      <p style="width: 100%; font-size: 8px; padding-bottom: 7px;"> <b> Observaciones </b> </p>
                      <p style="width: 100%; font-size: 8px;"> ${venta.observacion} </p>
                  `,
                    2: 'Second page',
                    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
                    last: 'Last Page'
                }
            }
        }

        // Configuraciones de documento
        var document = {
            html: html,
            data,
            path: (process.env.PUBLIC_DIR || './public') + '/pdf/venta-propia.pdf'
        }

        // Generacion de PDF
        await pdf.create(document, options);

        return '';

    }

    // Reporte excel
    async generarExcel(): Promise<any> {

        // Obtener ventas
        const ventas = await this.getAll({ direccion: -1, columna: 'createdAt' });

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Reporte - Ventas propias');

        worksheet.addRow(['Número', 'Fecha', 'Cliente', 'Precio total']);

        // Autofiltro

        worksheet.autoFilter = 'A1:E1';

        // Estilo de filas y columnas

        worksheet.getRow(1).height = 20;

        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true }
        });

        worksheet.getColumn(1).width = 14; // Codigo
        worksheet.getColumn(2).width = 15; // Fecha
        worksheet.getColumn(4).width = 40; // Cliente
        worksheet.getColumn(5).width = 25; // Precio total

        // Agregar elementos
        ventas.map(venta => {
            worksheet.addRow([
                venta.nro,
                add(venta.createdAt, { hours: -3 }),
                venta.cliente['descripcion'],
                Number(venta.precio_total)]);
        });

        // Generacion de reporte

        const nombreReporte = '../../public/excel/ventas-propias.xlsx';
        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then(async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
        });

        // const fechaHoy = new Date();

        // worksheet.addRow(['Fecha'])

        return true;

    }

}
