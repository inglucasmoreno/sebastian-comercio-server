import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IClientes } from 'src/clientes/interface/clientes.interface';
import { IPresupuestoProductos } from 'src/presupuesto-productos/interface/presupuesto-productos.interface';
import { PresupuestosDTO } from './dto/presupuestos.dto';
import { IPresupuestos } from './interface/presupuestos.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { format } from 'date-fns';
@Injectable()
export class PresupuestosService {

    constructor(
        @InjectModel('Presupuestos') private readonly presupuestosModel: Model<IPresupuestos>,
        @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
        @InjectModel('PresupuestoProductos') private readonly presupuestosProductosModel: Model<IPresupuestoProductos>,
    ) { };

    // Presupuesto por ID
    async getId(id: string): Promise<IPresupuestos> {

        // Se verifica si el presupuesto existe
        const presupuestoDB = await this.presupuestosModel.findById(id);
        if (!presupuestoDB) throw new NotFoundException('El presupuesto no existe');

        const pipeline = [];

        // Presupuesto por ID
        const idPresupuesto = new Types.ObjectId(id);
        pipeline.push({ $match: { _id: idPresupuesto } });

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

        // Informacion de proveedor
        pipeline.push({
            $lookup: { // Lookup
                from: 'proveedores',
                localField: 'despacha',
                foreignField: '_id',
                as: 'despacha'
            }
        }
        );

        pipeline.push({ $unwind: '$despacha' });

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

        const presupuesto = await this.presupuestosModel.aggregate(pipeline);

        return presupuesto[0];

    }

    // Listar presupuestos
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

        // Informacion de proveedor
        pipeline.push({
            $lookup: { // Lookup
                from: 'proveedores',
                localField: 'despacha',
                foreignField: '_id',
                as: 'despacha'
            }
        }
        );

        pipeline.push({ $unwind: '$despacha' });

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
            pipeline.push({ $match: { $or: [{ nro: Number(parametro) }, { 'cliente.descripcion': regex }] } });
            pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }, { 'cliente.descripcion': regex }] } });

        }

        // Ordenando datos
        const ordenar: any = {};
        if (columna) {
            ordenar[String(columna)] = Number(direccion);
            pipeline.push({ $sort: ordenar });
        }

        // Paginacion
        pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

        const [presupuestos, presupuestosTotal] = await Promise.all([
            this.presupuestosModel.aggregate(pipeline),
            this.presupuestosModel.aggregate(pipelineTotal),
        ])

        return {
            presupuestos,
            totalItems: presupuestosTotal.length
        };

    }

    // Crear presupuesto
    async insert(presupuestosDTO: PresupuestosDTO): Promise<any> {

        let {
            cliente,
            productos,
            tipo_identificacion,
            identificacion,
            descripcion,
            observacion,
            direccion,
            telefono,
            correo_electronico,
            condicion_iva,
            precio_total,
            creatorUser,
            updatorUser
        } = presupuestosDTO;

        // SECCION CLIENTE

        if (cliente.trim() === '' && cliente.trim() !== '000000000000000000000000') {

            const clienteDB: any = await this.clientesModel.findOne({ identificacion });

            if (!clienteDB) { // El cliente no existe en la BD -> SE CREA

                const nuevoCliente = new this.clientesModel({
                    descripcion,
                    tipo_identificacion,
                    identificacion,
                    direccion,
                    correo_electronico,
                    condicion_iva,
                    creatorUser,
                    updatorUser
                })

                const clienteRes = await nuevoCliente.save();
                cliente = clienteRes._id;

            } else { // El identificador esta registrado -> Se corrige      
                cliente = clienteDB._id;
                descripcion = clienteDB.descripcion;
                identificacion = clienteDB.identificacion;
                tipo_identificacion = clienteDB.tipo_identificacion;
                condicion_iva: clienteDB.condicion_iva;
            }
        }

        // NRO DE PRESUPUESTO

        let nroPresupuesto: number = 0;

        const presupuestos = await this.presupuestosModel.find()
            .sort({ createdAt: -1 })
            .limit(1)

        presupuestos.length === 0 ? nroPresupuesto = 1 : nroPresupuesto = Number(presupuestos[0].nro + 1);

        // GENERACION DE PRESUPUESTO

        const dataPresupuesto = {
            cliente,
            nro: nroPresupuesto,
            descripcion,
            observacion,
            tipo_identificacion,
            identificacion,
            direccion,
            telefono,
            correo_electronico,
            condicion_iva,
            precio_total,
            creatorUser,
            updatorUser
        };

        const nuevoPresupuesto = new this.presupuestosModel(dataPresupuesto);
        const presupuestoDB = await nuevoPresupuesto.save();

        // CARGA DE PRODUCTOS
        let productosPresupuesto: any = productos;
        productosPresupuesto.map(producto => producto.presupuesto = String(presupuestoDB._id))

        await this.presupuestosProductosModel.insertMany(productosPresupuesto);

        // Generar PDF

        let html: any;

        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/presupuesto.html', 'utf-8');

        var options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            footer: {
                height: "35mm",
                contents: {
                    first: `
                        <p style="width: 100%; font-size: 9px; padding-bottom: 7px; padding:10px; border-top: 1px solid black; text-align:right; margin-bottom: 10px;"> <b style="background-color:#ECECEC; padding:10px; border-top: 1px solid black;"> Precio total: </b> <span style="background-color:#ECECEC; padding: 10px; border-top: 1px solid black;"> $${Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(presupuestoDB.precio_total)} </span> </p>
                        <p style="width: 100%; font-size: 8px; padding-bottom: 7px;"> <b> Observaciones </b> </p>
                        <p style="width: 100%; font-size: 8px;"> Los precios pueden modificarse sin previo aviso. </p>
                        <p style="width: 100%; font-size: 8px;"> ${presupuestoDB.observacion} </p>
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
        const { nro } = presupuestoDB;
        if (nro <= 9) mostrarNumero = 'P000000' + String(nro);
        else if (nro <= 99) mostrarNumero = 'P00000' + String(nro);
        else if (nro <= 999) mostrarNumero = 'P0000' + String(nro);
        else if (nro <= 9999) mostrarNumero = 'P000' + String(nro);
        else if (nro <= 99999) mostrarNumero = 'P00' + String(nro);
        else if (nro <= 999999) mostrarNumero = 'P0' + String(nro);

        const data = {
            fecha: format(presupuestoDB.createdAt, 'dd/MM/yyyy'),
            numero: mostrarNumero,
            descripcion: presupuestoDB.descripcion,
            correo_electronico: presupuestoDB.correo_electronico,
            condicion_iva: presupuestoDB.condicion_iva,
            direccion: presupuestoDB.direccion,
            telefono: presupuestoDB.telefono,
            productos: productosPDF,
            total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(presupuestoDB.precio_total)
        };

        // Configuraciones de documento
        var document = {
            html: html,
            data,
            path: (process.env.PUBLIC_DIR || './public') + '/pdf/presupuesto.pdf'
        }

        // Generacion de PDF
        await pdf.create(document, options);

        return 'Presupuesto creado correctamente';


    }

    // Actualizar presupuesto
    async update(id: string, presupuestosUpdateDTO: any): Promise<IPresupuestos> {

        const presupuestoDB = await this.presupuestosModel.findById(id);

        // Verificacion: El presupuestos no existe
        if (!presupuestoDB) throw new NotFoundException('El presupuesto no existe');

        const presupuesto = await this.presupuestosModel.findByIdAndUpdate(id, presupuestosUpdateDTO, { new: true });
        return presupuesto;

    }

    // Generar PDF
    async generarPDF(dataFront: any): Promise<any> {

        // Promisa ALL
        const [presupuesto, productos] = await Promise.all([
            this.presupuestosModel.findById(dataFront.presupuesto),
            this.presupuestosProductosModel.find({ presupuesto: dataFront.presupuesto })
        ]);

        let html: any;

        html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/presupuesto.html', 'utf-8');

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
        const { nro } = presupuesto;
        if (nro <= 9) mostrarNumero = 'P000000' + String(nro);
        else if (nro <= 99) mostrarNumero = 'P00000' + String(nro);
        else if (nro <= 999) mostrarNumero = 'P0000' + String(nro);
        else if (nro <= 9999) mostrarNumero = 'P000' + String(nro);
        else if (nro <= 99999) mostrarNumero = 'P00' + String(nro);
        else if (nro <= 999999) mostrarNumero = 'P0' + String(nro);

        const data = {
            fecha: format(presupuesto.createdAt, 'dd/MM/yyyy'),
            numero: mostrarNumero,
            descripcion: presupuesto.descripcion,
            correo_electronico: presupuesto.correo_electronico,
            condicion_iva: presupuesto.condicion_iva,
            direccion: presupuesto.direccion,
            telefono: presupuesto.telefono,
            productos: productosPDF,
            total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(presupuesto.precio_total)
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
                        <p style="width: 100%; font-size: 8px;"> Los precios pueden modificarse sin previo aviso. </p>
                        <p style="width: 100%; font-size: 8px;"> ${presupuesto.observacion} </p>
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
            path: (process.env.PUBLIC_DIR || './public') + '/pdf/presupuesto.pdf'
        }

        // Generacion de PDF
        await pdf.create(document, options);

        return '';

    }


}
