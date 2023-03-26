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
import { IRecibosCobroVenta } from 'src/recibos-cobro-venta/interface/recibos-cobro-venta.interface';
import { IProductos } from 'src/productos/interface/productos.interface';

@Injectable()
export class VentasPropiasService {

    proveedoresModel: any;

    constructor(
        @InjectModel('VentasPropias') private readonly ventasModel: Model<IVentasPropias>,
        @InjectModel('Productos') private readonly productosModel: Model<IProductos>,
        @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
        @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
        @InjectModel('VentasPropiasCheques') private readonly ventasPropiasChequesModel: Model<IVentasPropiasCheques>,
        @InjectModel('CcClientes') private readonly ccClientesModel: Model<ICcClientes>,
        @InjectModel('CcClientesMovimientos') private readonly ccClientesMovimientosModel: Model<ICcClientesMovimientos>,
        @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
        @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
        @InjectModel('VentasPropiasProductos') private readonly ventaProductosModel: Model<IVentasPropiasProductos>,
        @InjectModel('RecibosCobroVenta') private readonly recibosCobroVentaModel: Model<IRecibosCobroVenta>,
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
    async getAll(querys: any): Promise<any> {

        const {
            columna,
            direccion,
            desde,
            registerpp,
            activo,
            parametro,
            cliente,
            cancelada
        } = querys;

        const pipeline = [];
        const pipelineTotal = [];

        pipeline.push({ $match: {} });
        pipelineTotal.push({ $match: {} });

        // Filtrado por cliente
        if (cliente && cliente !== '') {
            const idCliente = new Types.ObjectId(cliente);
            pipeline.push({ $match: { cliente: idCliente } });
            pipelineTotal.push({ $match: { cliente: idCliente } });
        }

        // Filtro por venta cancelada
        let filtroCancelada = {};
        if (cancelada && cancelada !== '') {
            filtroCancelada = { cancelada: cancelada === 'true' ? true : false };
            pipeline.push({ $match: filtroCancelada });
            pipelineTotal.push({ $match: filtroCancelada });
        }

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
            pipeline.push({ $match: { $or: [{ nro: Number(parametro) }, { 'cliente.descripcion': regex }, { observacion: regex }] } });
            pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }, { 'cliente.descripcion': regex }, { observacion: regex } ] } });

        }

        // Ordenando datos
        const ordenar: any = {};
        if (columna) {
            ordenar[String(columna)] = Number(direccion);
            pipeline.push({ $sort: ordenar });
        }

        // Paginacion
        pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

        const [ventas, ventasTotal] = await Promise.all([
            this.ventasModel.aggregate(pipeline),
            this.ventasModel.aggregate(pipelineTotal),
        ])

        return {
            ventas,
            totalItems: ventasTotal.length
        };

    }

    // Crear venta
    async insert(ventasDTO: VentasPropiasDTO): Promise<any> {

        let {
            tipo_venta,
            cliente,
            formas_pago,
            cheques,
            fecha_venta,
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
            fecha_venta: add(new Date(fecha_venta), { hours: 3 }),
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

        // Proximo numero de movimiento
        let nroMovimientoCC = 0;
        const ultimoCCMov = await this.ccClientesMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
        ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

        // (-) Decremento en cuenta corriente de cliente
        if (decrementoCC) {
            const cuentaCorrienteDB: any = await this.ccClientesModel.findOne({ cliente });
            if (cuentaCorrienteDB) {

                await this.ccClientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: cuentaCorrienteDB.saldo - montoDecremento })

                // Creacion de movimient0

                nroMovimientoCC += 1;
                const dataMovimiento = {
                    nro: nroMovimientoCC,
                    descripcion: `VENTA ${codigoVenta}`,
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

                await this.ccClientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: cuentaCorrienteDB.saldo + montoIncremento })

                // Creacion de movimiento

                nroMovimientoCC += 1;
                const dataMovimiento = {
                    nro: nroMovimientoCC,
                    descripcion: `VENTA ${codigoVenta}`,
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

        // Proximo numero de movimiento - MOVIMIENTOS DE CAJA
        let nroMovimientoCaja = 0;
        const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
        ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

        // IMPACTO - EN CAJAS
        formas_pago.map(async (forma_pago: any) => {

            if (forma_pago._id !== 'cuenta_corriente') {

                const cajaDB = await this.cajasModel.findById(forma_pago._id)

                nroMovimientoCaja += 1;
                const data = {
                    nro: nroMovimientoCaja,
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
            nroMovimientoCaja += 1;
            const data = {
                nro: nroMovimientoCaja,
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

        // Impacto en stock
        productosVenta.map( async producto => {
            await this.productosModel.findByIdAndUpdate(producto.producto, { $inc: { cantidad: -producto.cantidad } })    
        })

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
        let formasPagoPDF: any[] = [];
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

        // Adaptando formas de pago
        venta.formas_pago.map((forma: any) => formasPagoPDF.push({
            descripcion: forma.descripcion,
            monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(forma.monto),
        }));

        // Cheques
        if (totalEnCheques > 0) formasPagoPDF.push({ descripcion: 'CHEQUES', monto: totalEnCheques });

        const data = {
            fecha: venta.fecha_venta ? format(venta.fecha_venta, 'dd/MM/yyyy') : format(venta.createdAt, 'dd/MM/yyyy'),
            numero: mostrarNumero,
            formas_pago: formasPagoPDF,
            fecha_venta: add(new Date(fecha_venta), { hours: 3 }),
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

    // Alta y Baja de venta
    async altaBaja(id: string, data: any): Promise<IVentasPropias> {

        const { estado, creatorUser, updatorUser } = data;

        const ventaDB = await this.ventasModel.findById(id);

        // Verificacion: La venta no existe
        if (!ventaDB) throw new NotFoundException('La venta no existe');

        // Verificacion: Si tiene recibos de cobros asociados no puede darse de baja
        const reciboVentaDB = await this.recibosCobroVentaModel.find({ venta_propia: ventaDB._id });
        if(reciboVentaDB.length !== 0) throw new NotFoundException('La venta tiene un recibo de cobro asociado');

        let condicion: any = null;
        let saldoCC: number = 0;
        let saldoCaja: number = 0;

        if (estado === 'Alta') {
            condicion = { activo: true };
        } else if (estado === 'Baja') {
            condicion = { activo: false };
        }

        // AJUSTE DE SALDOS

        ventaDB.formas_pago.map(async (pago: any) => {
            
            let codigoVenta: string;
            const { nro } = ventaDB;
            if (nro <= 9) codigoVenta = 'VP000000' + String(nro);
            else if (nro <= 99) codigoVenta = 'VP00000' + String(nro);
            else if (nro <= 999) codigoVenta = 'VP0000' + String(nro);
            else if (nro <= 9999) codigoVenta = 'VP000' + String(nro);
            else if (nro <= 99999) codigoVenta = 'VP00' + String(nro);
            else if (nro <= 999999) codigoVenta = 'VP0' + String(nro);


            // CAJAS VARIAS
            if(pago._id !== 'cuenta_corriente'){
                
                // Impacto en saldo
                const caja = await this.cajasModel.findById(pago._id);
                if(estado === 'Alta') saldoCaja = caja.saldo + pago.monto;
                else saldoCaja = caja.saldo - pago.monto;
                await this.cajasModel.findByIdAndUpdate(caja._id, { saldo: saldoCaja });

                // Generacion de movimiento

                let nroMovimientoCaja = 0;
                const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
                ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

                nroMovimientoCaja += 1;
                const dataMovimiento = {
                    nro: nroMovimientoCaja,
                    descripcion: estado === 'Alta' ?  `ALTA DE VENTA - ${codigoVenta}` : `BAJA DE VENTA - ${codigoVenta}`,
                    tipo: estado === 'Alta' ? 'Debe' : 'Haber',
                    caja: String(caja._id),
                    venta_propia: String(ventaDB._id),
                    monto: this.redondear(pago.monto, 2),
                    saldo_anterior: this.redondear(caja.saldo, 2),
                    saldo_nuevo: estado === 'Alta' ? this.redondear(caja.saldo + pago.monto, 2) : this.redondear(caja.saldo - pago.monto, 2),
                    creatorUser,
                    updatorUser
                }

                const nuevoMovimiento = new this.cajasMovimientosModel(dataMovimiento);
                await nuevoMovimiento.save();

            }

            // CUENTA CORRIENTE
            if (pago._id === 'cuenta_corriente') {
                
                // Impacto en saldo
                const cc_cliente = await this.ccClientesModel.findOne({ cliente: ventaDB.cliente });
                if(estado === 'Alta') saldoCC = cc_cliente.saldo - pago.monto;
                else saldoCC = cc_cliente.saldo + pago.monto;
                await this.ccClientesModel.findByIdAndUpdate(cc_cliente._id, { saldo: saldoCC });
            
                // Generacion de movimiento

                let nroMovimientoCC = 0;
                const ultimoCCMov = await this.ccClientesMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
                ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

                nroMovimientoCC += 1;
                const dataMovimiento = {
                    nro: nroMovimientoCC,
                    descripcion: estado === 'Alta' ?  `ALTA DE VENTA - ${codigoVenta}` : `BAJA DE VENTA - ${codigoVenta}`,
                    tipo: estado === 'Alta' ? 'Haber' : 'Debe',
                    cc_cliente: String(cc_cliente._id),
                    cliente: String(ventaDB.cliente),
                    venta_propia: String(ventaDB._id),
                    monto: this.redondear(pago.monto, 2),
                    saldo_anterior: this.redondear(cc_cliente.saldo, 2),
                    saldo_nuevo: estado === 'Alta' ? this.redondear(cc_cliente.saldo - pago.monto, 2) : this.redondear(cc_cliente.saldo + pago.monto, 2),
                    creatorUser,
                    updatorUser
                }

                const nuevoMovimiento = new this.ccClientesMovimientosModel(dataMovimiento);
                await nuevoMovimiento.save();


            }
        
        });

        // CHEQUES

        let saldoCheque = 0;

        const pipelineCheques = [];
        
        const idVenta = new Types.ObjectId(ventaDB._id);
        pipelineCheques.push({$match:{ venta_propia: idVenta }});

        // Informacion de cliente - TOTAL
        pipelineCheques.push({
            $lookup: { // Lookup
                from: 'cheques',
                localField: 'cheque',
                foreignField: '_id',
                as: 'cheque'
            }
        }
        );

        pipelineCheques.push({ $unwind: '$cheque' });

        const cheques = await this.ventasPropiasChequesModel.aggregate(pipelineCheques);
        
        // RECORRIDO Y BAJA DE CHEQUES
        cheques.map( async (elemento: any) => {
            saldoCheque += elemento.cheque.importe;
            let dataCheque: any = null
            if(estado === 'Alta') dataCheque = { estado: 'Creado', activo: true };  
            else dataCheque = { estado: 'Baja', activo: false };  
            await this.chequesModel.findByIdAndUpdate(elemento.cheque._id, dataCheque);
        });

        if(saldoCheque){
            const cajaCheque = await this.cajasModel.findById('222222222222222222222222');
            if(estado === 'Alta') saldoCheque = cajaCheque.saldo + saldoCheque;
            else saldoCheque = cajaCheque.saldo - saldoCheque;
            await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: saldoCheque });
        }

        // Generando movimientos
        const venta = await this.ventasModel.findByIdAndUpdate(id, condicion, { new: true });
        return venta;

    }


    // Generar PDF
    async generarPDF(dataFront: any): Promise<any> {

        const pipeline: any = [];

        // Relacion por ID
        const idVentaPropia = new Types.ObjectId(dataFront.venta);
        pipeline.push({ $match: { venta_propia: idVentaPropia } });

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

        // Promisa ALL
        const [venta, productos, relaciones] = await Promise.all([
            this.getId(dataFront.venta),
            this.ventaProductosModel.find({ venta_propia: dataFront.venta }),
            this.ventasPropiasChequesModel.aggregate(pipeline)
        ]);

        let html: any;

        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/venta-propia.html', 'utf-8');

        let productosPDF: any[] = [];
        let formasPagoPDF: any[] = [];

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

        // Adaptando formas de pago
        venta.formas_pago.map((forma: any) => formasPagoPDF.push({
            descripcion: forma.descripcion,
            monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(forma.monto),
        }));

        // Cheques
        if (relaciones && relaciones.length !== 0) {
            let montoCheques = 0;
            relaciones.map((relacion: any) => montoCheques += relacion.cheque.importe);
            formasPagoPDF.push({
                descripcion: 'CHEQUES',
                monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montoCheques),
            })
        }

        const data = {
            fecha: venta.fecha_venta ? format(venta.fecha_venta, 'dd/MM/yyyy') : format(venta.createdAt, 'dd/MM/yyyy'),
            numero: mostrarNumero,
            descripcion: venta.cliente['descripcion'],
            formas_pago: formasPagoPDF,
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
        const respuesta = await this.getAll({
            direccion: -1,
            columna: 'createdAt',
            desde: 0,
            registerpp: 1000000
        });

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Reporte - Ventas propias');

        worksheet.addRow(['Número', 'Fecha de venta', 'Fecha de carga', 'Cliente', 'Precio total', 'Habilitada', 'Cancelada']);

        // Autofiltro

        worksheet.autoFilter = 'A1:G1';

        // Estilo de filas y columnas

        worksheet.getRow(1).height = 20;

        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true }
        });

        worksheet.getColumn(1).width = 14; // Codigo
        worksheet.getColumn(2).width = 15; // Fecha de venta
        worksheet.getColumn(3).width = 15; // Fecha de carga
        worksheet.getColumn(4).width = 40; // Cliente
        worksheet.getColumn(5).width = 25; // Precio total
        worksheet.getColumn(6).width = 15; // Habilitadas
        worksheet.getColumn(7).width = 16; // Canceladas

        // Agregar elementos
        respuesta.ventas.map(venta => {
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
