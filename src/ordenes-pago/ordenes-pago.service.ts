import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ICcProveedoresMovimientos } from 'src/cc-proveedores-movimientos/interface/cc-proveedores-movimientos.interface';
import { ICcProveedores } from 'src/cc-proveedores/interface/cc-proveedores.interface';
import { ICheques } from 'src/cheques/interface/cheques.interface';
import { ICompras } from 'src/compras/interface/compras.interface';
import { IOrdenesPagoCheques } from 'src/ordenes-pago-cheques/interface/ordenes-pago-cheques.interface';
import { IOrdenesPagoCompra } from 'src/ordenes-pago-compra/interface/ordenes-pago-compra.interface';
import { OrdenesPagoUpdateDTO } from './dto/ordenes-pago-update.dto';
import { OrdenesPagoDTO } from './dto/ordenes-pago.dto';
import { IOrdenesPago } from './interface/ordenes-pago.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';

@Injectable()
export class OrdenesPagoService {

  constructor(
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    @InjectModel('OrdenesPago') private readonly ordenesPagoModel: Model<IOrdenesPago>,
    @InjectModel('OrdenesPagoCompra') private readonly ordenesPagoCompraModel: Model<IOrdenesPagoCompra>,
    @InjectModel('OrdenesPagoCheque') private readonly ordenesPagoChequeModel: Model<IOrdenesPagoCheques>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
    @InjectModel('CcProveedores') private readonly ccProveedoresModel: Model<ICcProveedores>,
    @InjectModel('CcProveedoresMovimientos') private readonly ccProveedoresMovimientosModel: Model<ICcProveedoresMovimientos>,
  ) { };

  // Orden pago por ID
  async getId(id: string): Promise<IOrdenesPago> {

    // Se verifica que la orden de pago existe
    const ordenPagoDB = await this.ordenesPagoModel.findById(id);
    if (!ordenPagoDB) throw new NotFoundException('La orden de pago no existe');

    const pipeline = [];

    // Orden de pago por ID
    const idOrdenPago = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idOrdenPago } })

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

    const ordenesPago = await this.ordenesPagoModel.aggregate(pipeline);

    return ordenesPago[0];

  }

  // Listar ordenes de pago
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
      pipeline.push({ $match: { $or: [{ nro: Number(parametro) }, { observacion: regex }, { 'proveedor.descripcion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }, { observacion: regex }, { 'proveedor.descripcion': regex }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [ordenes_pago, ordenesPagoTotal] = await Promise.all([
      this.ordenesPagoModel.aggregate(pipeline),
      this.ordenesPagoModel.aggregate(pipelineTotal),
    ])

    return {
      ordenes_pago,
      totalItems: ordenesPagoTotal.length
    };

  }

  // Crear ordenes de pago
  async insert(ordenesPagoDTO: any): Promise<any> {
    
    const {
      proveedor,
      fecha_pago,
      formas_pago,
      pago_total,
      carro_pago,
      cheques,
      observacion,
      creatorUser,
      updatorUser,
    } = ordenesPagoDTO;

    //** VERIFICACIONES INICIALES */

    // Cheques validos al momento de pagar

    let chequeInvalido: any;

    await Promise.all(
      cheques.map( async cheque => {
        const chequeDB = await this.chequesModel.findById(cheque._id);
        if(chequeDB.estado !== 'Creado') chequeInvalido = chequeDB;
      })
    );

    if(chequeInvalido) throw new NotFoundException(`El #${chequeInvalido.nro_cheque} no esta en cartera`);
    
    //** GENERACION DE ORDEN DE PAGO

    // Generacion de numero

    let nroPago: number = 0;

    const pagos: any[] = await this.ordenesPagoModel.find()
      .sort({ createdAt: -1 })
      .limit(1)

    pagos.length === 0 ? nroPago = 1 : nroPago = pagos[0].nro + 1;

    const dataPago = {
      nro: nroPago,
      proveedor,
      fecha_pago: add(new Date(fecha_pago), { hours: 3 }),
      formas_pago,
      pago_total,
      observacion,
      creatorUser,
      updatorUser
    }

    const nuevoPago = new this.ordenesPagoModel(dataPago);
    const pagoDB = await nuevoPago.save();

    // Codigo de pago
    let codigoPago: string;
    if (pagoDB.nro <= 9) codigoPago = 'OP000000' + String(pagoDB.nro);
    else if (pagoDB.nro <= 99) codigoPago = 'OP00000' + String(pagoDB.nro);
    else if (pagoDB.nro <= 999) codigoPago = 'OP0000' + String(pagoDB.nro);
    else if (pagoDB.nro <= 9999) codigoPago = 'OP000' + String(pagoDB.nro);
    else if (pagoDB.nro <= 99999) codigoPago = 'OP00' + String(pagoDB.nro);
    else if (pagoDB.nro <= 999999) codigoPago = 'OP0' + String(pagoDB.nro);

    const descripcion = `PAGO ${codigoPago}`;

    //** RELACION PAGO - COMPRA

    // PAGO -> COMPRAS - SI NO HAY RELACION ES UN ANTICIPO
    if (carro_pago.length !== 0) {
      carro_pago.map(async elemento => {

        const dataPago = {
          orden_pago: pagoDB._id,
          compra: elemento.compra,
          fecha_pago: add(new Date(fecha_pago), { hours: 3 }),
          total_deuda: elemento.total_deuda,
          compra_cancelada: elemento.cancelada,
          monto_pagado: this.redondear(elemento.monto_pagado, 2),
          monto_deuda: this.redondear(elemento.monto_deuda, 2),
          creatorUser,
          updatorUser
        }

        // Relacion -> Orden de pago - Compra
        const nuevaRelacion = new this.ordenesPagoCompraModel(dataPago);
        await nuevaRelacion.save();

        // Actualizacion de compra
        await this.comprasModel.findByIdAndUpdate(elemento.compra, {
          cancelada: elemento.cancelada,
          monto_deuda: this.redondear(elemento.monto_deuda, 2)
        });

      })
    }

    //** RELACION PAGOS - CHEQUES

    let totalCheques = 0;

    // RECORRIDO -> CHEQUES
    for( const elemento of cheques ) {

    // cheques.map(async elemento => {

      totalCheques += elemento.importe;

      const dataPagoCheque = {
        orden_pago: pagoDB._id,
        cheque: elemento._id,
        creatorUser,
        updatorUser
      }

      // Relacion Pago - Cheque
      const nuevaRelacion = new this.ordenesPagoChequeModel(dataPagoCheque);
      await nuevaRelacion.save();

      // Actualizacion de cheques
      await this.chequesModel.findByIdAndUpdate(elemento._id, { 
        estado: 'Transferido', 
        destino: String(proveedor), 
        fecha_salida: add(new Date(fecha_pago), { hours: 3 }),
      });

    // })
    
    }

    //** IMPACTOS EN CAJA - CHEQUES + MOVIMIENTOS

    // Proximo numero de movimiento
    let nroMovimientoCaja = 0;
    const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

    if (cheques.length !== 0) {

      const chequeDB = await this.cajasModel.findById('222222222222222222222222')

      // Impacto en caja
      const nuevoSaldoCheque = this.redondear(chequeDB.saldo - totalCheques, 2);
      await this.cajasModel.findByIdAndUpdate(chequeDB._id, { saldo: nuevoSaldoCheque });

      // Movimientos en cajas
      nroMovimientoCaja += 1;
      const dataMovimientoCaja = {
        nro: nroMovimientoCaja,
        tipo: 'Haber',
        descripcion,
        caja: chequeDB._id,
        saldo_anterior: this.redondear(chequeDB.saldo, 2),
        saldo_nuevo: nuevoSaldoCheque,
        monto: this.redondear(totalCheques, 2),
        compra: '',
        orden_pago: pagoDB._id,
        creatorUser,
        updatorUser
      }

      const nuevoMovimientoCaja = new this.cajasMovimientosModel(dataMovimientoCaja);
      await nuevoMovimientoCaja.save();


    }

    // Proximo numero de movimiento
    let nroMovimientoCC = 0;
    const ultimoCCMov = await this.ccProveedoresMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

    //** IMPACTO EN CUENTA CORRIENTE + MOVIMIENTOS

    const cuentaCorrienteDB = await this.ccProveedoresModel.findOne({ proveedor: String(proveedor) });

    // Impacto en saldo
    const nuevoSaldoCC = this.redondear(cuentaCorrienteDB.saldo + Number(pago_total), 2);
    await this.ccProveedoresModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldoCC });

    // Movimiento en cuenta corriente de proveedor
    nroMovimientoCC += 1;
    const dataMovimientoCC = {
      nro: nroMovimientoCC,
      tipo: 'Debe',
      descripcion,
      cc_proveedor: cuentaCorrienteDB._id,
      proveedor,
      saldo_anterior: this.redondear(cuentaCorrienteDB.saldo, 2),
      saldo_nuevo: nuevoSaldoCC,
      monto: this.redondear(Number(pago_total), 2),
      compra: '',
      orden_pago: pagoDB._id,
      creatorUser,
      updatorUser
    }

    const nuevoMovimientoCC = new this.ccProveedoresMovimientosModel(dataMovimientoCC);
    await nuevoMovimientoCC.save();

    //** IMPACTOS EN CAJAS + MOVIMIENTOS

    formas_pago.map(async elemento => {

      const cajaDB = await this.cajasModel.findById(elemento._id)

      // Impacto en caja
      const nuevoSaldoCaja = cajaDB.saldo - elemento.monto;
      await this.cajasModel.findByIdAndUpdate(elemento._id, { saldo: nuevoSaldoCaja });

      // Movimientos en cajas
      nroMovimientoCaja += 1;
      const dataMovimientoCaja = {
        nro: nroMovimientoCaja,
        tipo: 'Haber',
        descripcion,
        caja: cajaDB._id,
        saldo_anterior: this.redondear(cajaDB.saldo, 2),
        saldo_nuevo: nuevoSaldoCaja,
        monto: this.redondear(Number(elemento.monto), 2),
        compra: '',
        orden_pago: pagoDB._id,
        creatorUser,
        updatorUser
      }

      const nuevoMovimientoCaja = new this.cajasMovimientosModel(dataMovimientoCaja);
      await nuevoMovimientoCaja.save();

    })

    //** GENERACION DE ORDEN DE PAGO - PDF

    // ORDEN DE PAGO - COMPRA
    const pipeline = [];

    const idPago = new Types.ObjectId(pagoDB._id);
    pipeline.push({ $match: { orden_pago: idPago } })

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

    // Ordenando datos
    const ordenar: any = {};
    ordenar['createdAt'] = -1;
    pipeline.push({ $sort: ordenar });

    // ORDEN DE PAGO - COMPRA
    const pipelineCheques = [];

    pipelineCheques.push({ $match: { orden_pago: idPago } })

    // Informacion de cheques
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

    // Promise ALL
    const [orden_pago, comprobantes, chequesDB] = await Promise.all([
      this.getId(pagoDB._id),
      this.ordenesPagoCompraModel.aggregate(pipeline),
      this.ordenesPagoChequeModel.aggregate(pipelineCheques)
    ]);

    // ADAPTANDO COMPROBANTES

    const comprobantesPDF = [];
    let montoAPagar = 0;

    comprobantes.map(comprobante => {

      montoAPagar += comprobante.monto_pagado;

      // Adaptando numero
      let nroComprobante: string;
      const { nro } = comprobante.compra;
      if (nro <= 9) nroComprobante = 'C000000' + String(nro);
      else if (nro <= 99) nroComprobante = 'C00000' + String(nro);
      else if (nro <= 999) nroComprobante = 'C0000' + String(nro);
      else if (nro <= 9999) nroComprobante = 'C000' + String(nro);
      else if (nro <= 99999) nroComprobante = 'C00' + String(nro);
      else if (nro <= 999999) nroComprobante = 'C0' + String(nro);

      comprobantesPDF.push({
        fecha: comprobante.compra.fecha_compra ? format(comprobante.compra.fecha_compra, 'dd/MM/yyyy') : format(comprobante.compra.createdAt, 'dd/MM/yyyy'),
        nro: nroComprobante,
        estado: comprobante.compra_cancelada === false ? 'PAGO PARCIAL' : 'CANCELADO',
        total_deuda: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.total_deuda)),
        pago_monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_pagado)),
        anticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_pagado)),
      });

    });

    // ADAPTANDO CHEQUES

    const chequesPDF = [];

    chequesDB.map(elemento => {
      chequesPDF.push({
        nro: elemento.cheque.nro_cheque,
        monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(elemento.cheque.importe)),
      });
    });

    // ADAPTANDO FORMAS DE PAGO

    const formasPagoPDF = [];

    orden_pago.formas_pago.map(elemento => {
      formasPagoPDF.push({
        descripcion: elemento.descripcion,
        monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(elemento.monto)),
      });
    });

    // GENERACION DE PDF

    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/orden-pago.html', 'utf-8');

    // Adaptando numero
    let mostrarNumero: string;
    const { nro } = orden_pago;
    if (nro <= 9) mostrarNumero = 'OP000000' + String(nro);
    else if (nro <= 99) mostrarNumero = 'OP00000' + String(nro);
    else if (nro <= 999) mostrarNumero = 'OP0000' + String(nro);
    else if (nro <= 9999) mostrarNumero = 'OP000' + String(nro);
    else if (nro <= 99999) mostrarNumero = 'OP00' + String(nro);
    else if (nro <= 999999) mostrarNumero = 'OP0' + String(nro);

    const data = {
      fecha: orden_pago.fecha_pago ? format(orden_pago.fecha_pago, 'dd/MM/yyyy') : format(orden_pago.createdAt, 'dd/MM/yyyy'),
      proveedor: orden_pago.proveedor['descripcion'],
      numero: mostrarNumero,
      pago_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(orden_pago.pago_total)),
      comprobantesPDF,
      formasPagoPDF,
      chequesPDF, 
      anticipo: comprobantesPDF.length === 0 ? true : false,
      montoAPagar: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(montoAPagar)),
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(orden_pago.pago_total)),
      flagAnticipo: (Number(orden_pago.pago_total) - montoAPagar) === 0 ? false : true,
      montoAnticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(orden_pago.pago_total) - montoAPagar),
    };

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: "35mm",
        contents: {}
      }
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/orden_pago.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'Recibo generado correctamente';

  }

  // Actualizar orden de pago
  async update(id: string, ordenesPagoUpdateDTO: OrdenesPagoUpdateDTO): Promise<IOrdenesPago> {

    const ordenesPagoDB = await this.ordenesPagoModel.findById(id);

    // Verificacion: La orden de pago no existe
    if (!ordenesPagoDB) throw new NotFoundException('La orden no existe');

    const ordenesPago = await this.ordenesPagoModel.findByIdAndUpdate(id, ordenesPagoUpdateDTO, { new: true });
    return ordenesPago;

  }


  // Generar PDF
  async generarPDF(dataFront: any): Promise<any> {

    // ORDENES DE PAGO - COMPRA
    const pipeline = [];

    const idOrdenPago = new Types.ObjectId(dataFront.orden_pago);
    pipeline.push({ $match: { orden_pago: idOrdenPago } })

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

    // Ordenando datos
    const ordenar: any = {};
    ordenar['createdAt'] = -1;
    pipeline.push({ $sort: ordenar });

    // ORDEN DE PAGO - COMPRA
    const pipelineCheques = [];

    pipelineCheques.push({ $match: { orden_pago: idOrdenPago } })

    // Informacion de cheques
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

    // Promise ALL
    const [orden_pago, comprobantes, cheques] = await Promise.all([
      this.getId(dataFront.orden_pago),
      this.ordenesPagoCompraModel.aggregate(pipeline),
      this.ordenesPagoChequeModel.aggregate(pipelineCheques)
    ]);

    // ADAPTANDO COMPROBANTES

    const comprobantesPDF = [];
    let montoAPagar = 0;

    comprobantes.map(comprobante => {

      montoAPagar += comprobante.monto_pagado;

      // Adaptando numero
      let nroComprobante: string;
      const { nro } = comprobante.compra;
      if (nro <= 9) nroComprobante = 'C000000' + String(nro);
      else if (nro <= 99) nroComprobante = 'C00000' + String(nro);
      else if (nro <= 999) nroComprobante = 'C0000' + String(nro);
      else if (nro <= 9999) nroComprobante = 'C000' + String(nro);
      else if (nro <= 99999) nroComprobante = 'C00' + String(nro);
      else if (nro <= 999999) nroComprobante = 'C0' + String(nro);

      comprobantesPDF.push({
        fecha: comprobante.compra.fecha_compra ? format(comprobante.compra.fecha_compra, 'dd/MM/yyyy') : format(comprobante.compra.createdAt, 'dd/MM/yyyy'),
        nro: nroComprobante,
        estado: comprobante.compra_cancelada === false ? 'PAGO PARCIAL' : 'CANCELADO',
        total_deuda: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.total_deuda)),
        pago_monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_pagado)),
        anticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_pagado)),
      });

    });

    // ADAPTANDO CHEQUES

    const chequesPDF = [];

    cheques.map(elemento => {
      chequesPDF.push({
        nro: elemento.cheque.nro_cheque,
        monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(elemento.cheque.importe)),
      });
    });

    // ADAPTANDO FORMAS DE PAGO

    const formasPagoPDF = [];

    orden_pago.formas_pago.map(elemento => {
      formasPagoPDF.push({
        descripcion: elemento.descripcion,
        monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(elemento.monto)),
      });
    });

    // GENERACION DE PDF

    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/orden-pago.html', 'utf-8');

    // Adaptando numero
    let mostrarNumero: string;
    const { nro } = orden_pago;
    if (nro <= 9) mostrarNumero = 'OP000000' + String(nro);
    else if (nro <= 99) mostrarNumero = 'OP00000' + String(nro);
    else if (nro <= 999) mostrarNumero = 'OP0000' + String(nro);
    else if (nro <= 9999) mostrarNumero = 'OP000' + String(nro);
    else if (nro <= 99999) mostrarNumero = 'OP00' + String(nro);
    else if (nro <= 999999) mostrarNumero = 'OP0' + String(nro);

    const data = {
      fecha: orden_pago.fecha_pago ? format(orden_pago.fecha_pago, 'dd/MM/yyyy') : format(orden_pago.createdAt, 'dd/MM/yyyy'),
      proveedor: orden_pago.proveedor['descripcion'],
      numero: mostrarNumero,
      pago_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(orden_pago.pago_total)),
      comprobantesPDF,
      formasPagoPDF,
      chequesPDF,
      anticipo: comprobantesPDF.length === 0 ? true : false,
      montoAPagar: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(montoAPagar)),
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(orden_pago.pago_total)),
      flagAnticipo: (Number(orden_pago.pago_total) - montoAPagar) === 0 ? false : true,
      montoAnticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(orden_pago.pago_total) - montoAPagar),
    };

    var options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      footer: {
        height: "35mm",
        contents: {}
      }
    }

    // Configuraciones de documento
    var document = {
      html: html,
      data,
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/orden_pago.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return '';

  }

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }


}
