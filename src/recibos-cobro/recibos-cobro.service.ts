import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ICcClientesMovimientos } from 'src/cc-clientes-movimientos/interface/cc-clientes-movimientos.interface';
import { ICcClientes } from 'src/cc-clientes/interface/cc-clientes.interface';
import { ICheques } from 'src/cheques/interface/cheques.interface';
import { IRecibosCobroCheque } from 'src/recibos-cobro-cheque/interface/recibos-cheque.interface';
import { IRecibosCobroVenta } from 'src/recibos-cobro-venta/interface/recibos-cobro-venta.interface';
import { IVentasPropias } from 'src/ventas-propias/interface/ventas-propias.interface';
import { IRecibosCobro } from './interface/recibos-cobro.interface';
import * as fs from 'fs';
import { add, format } from 'date-fns';
import * as pdf from 'pdf-creator-node';

@Injectable()
export class RecibosCobroService {

  constructor(
    @InjectModel('RecibosCobro') private readonly recibosCobroModel: Model<IRecibosCobro>,
    @InjectModel('RecibosCobroVenta') private readonly recibosCobroVentaModel: Model<IRecibosCobroVenta>,
    @InjectModel('RecibosCobroCheque') private readonly recibosCobroChequeModel: Model<IRecibosCobroCheque>,
    @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
    @InjectModel('CcClientes') private readonly ccClientesModel: Model<ICcClientes>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('CcClientesMovimientos') private readonly ccClientesMovimientosModel: Model<ICcClientesMovimientos>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
    @InjectModel('VentasPropias') private readonly ventasModel: Model<IVentasPropias>,
  ) { };

  // Recibo de cobro por ID
  async getId(id: string): Promise<IRecibosCobro> {

    // Se verifica que el recibo existe
    const reciboDB = await this.recibosCobroModel.findById(id);
    if (!reciboDB) throw new NotFoundException('El recibo no existe');

    const pipeline = [];

    // Recibo por ID
    const idRecibo = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRecibo } })

    // Informacion de clientes
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

    const recibo = await this.recibosCobroModel.aggregate(pipeline);

    return recibo[0];

  }

  // Listar recibos de cobro
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

    // Informacion de clientes
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

    // Informacion de clientes - TOTAL
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

    const [recibos, recibosTotal] = await Promise.all([
      this.recibosCobroModel.aggregate(pipeline),
      this.recibosCobroModel.aggregate(pipelineTotal),
    ])

    return {
      recibos,
      totalItems: recibosTotal.length
    };

  }

  // Crear recibo de cobro
  async insert(recibosCobrosDTO: any): Promise<any> {

    const {
      cliente,
      fecha_cobro,
      formas_pago,
      cobro_total,
      carro_pago,
      cheques,
      creatorUser,
      updatorUser,
    } = recibosCobrosDTO;

    //** GENERACION DE RECIBO DE COBRO

    // Generacion de numero

    let nroRecibo: number = 0;

    const recibos: any[] = await this.recibosCobroModel.find()
      .sort({ createdAt: -1 })
      .limit(1)

    recibos.length === 0 ? nroRecibo = 1 : nroRecibo = recibos[0].nro + 1;

    const dataRecibo = {
      nro: nroRecibo,
      cliente,
      fecha_cobro: add(new Date(fecha_cobro), { hours: 3 }),
      formas_pago,
      cobro_total,
      creatorUser,
      updatorUser
    }

    const nuevoRecibo = new this.recibosCobroModel(dataRecibo);
    const reciboDB: any = await nuevoRecibo.save();

    // Codigo de recibo
    let codigoRecibo: string;
    if (reciboDB.nro <= 9) codigoRecibo = 'RC000000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 99) codigoRecibo = 'RC00000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 999) codigoRecibo = 'RC0000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 9999) codigoRecibo = 'RC000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 99999) codigoRecibo = 'RC00' + String(reciboDB.nro);
    else if (reciboDB.nro <= 999999) codigoRecibo = 'RC0' + String(reciboDB.nro);

    const observacion = `COBRO ${codigoRecibo}`;

    //** RELACION RECIBOS - VENTAS

    // RECIBO -> VENTAS - SI NO HAY RELACION ES UN ANTICIPO
    if (carro_pago.length !== 0) {
      carro_pago.map(async elemento => {

        const dataReciboVenta = {
          recibo_cobro: reciboDB._id,
          venta_propia: elemento.venta,
          fecha_cobro: add(new Date(fecha_cobro), { hours: 3 }),
          total_deuda: elemento.total_deuda,
          venta_cancelada: elemento.cancelada,
          monto_cobrado: this.redondear(elemento.monto_cobrado, 2),
          monto_deuda: this.redondear(elemento.monto_deuda, 2),
          creatorUser,
          updatorUser
        }

        // Relacion -> Recibo - Venta
        const nuevaRelacion = new this.recibosCobroVentaModel(dataReciboVenta);
        await nuevaRelacion.save();

        // Actualizacion de venta
        await this.ventasModel.findByIdAndUpdate(elemento.venta, {
          cancelada: elemento.cancelada,
          deuda_monto: this.redondear(elemento.monto_deuda, 2)
        });

      })
    }

    //** RELACION RECIBOS - CHEQUES

    let totalCheques = 0;

    // RECORRIDO -> CHEQUES
    cheques.map(async elemento => {

      totalCheques += elemento.importe;

      const dataCheque = {
        ...elemento,
        creatorUser,
        updatorUser
      }

      // Generacion de cheque
      const nuevoCheque = new this.chequesModel(dataCheque);
      const chequeDB = await nuevoCheque.save();

      const dataReciboCheque = {
        recibo_cobro: reciboDB._id,
        cheque: chequeDB._id,
        creatorUser,
        updatorUser
      }

      // Relacion Recibo - Cheque
      const nuevaRelacion = new this.recibosCobroChequeModel(dataReciboCheque);
      await nuevaRelacion.save();

    })

    //** IMPACTOS EN CAJA - CHEQUES + MOVIMIENTOS

    // Proximo numero de movimiento
    let nroMovimientoCaja = 0;
    const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

    if (cheques.length !== 0) {

      const chequeDB = await this.cajasModel.findById('222222222222222222222222')

      // Impacto en caja
      const nuevoSaldoCheque = this.redondear(chequeDB.saldo + totalCheques, 2);
      await this.cajasModel.findByIdAndUpdate(chequeDB._id, { saldo: nuevoSaldoCheque });

      // Movimientos en cajas
      nroMovimientoCaja += 1;
      const dataMovimientoCaja = {
        nro: nroMovimientoCaja,
        tipo: 'Debe',
        descripcion: observacion,
        caja: chequeDB._id,
        saldo_anterior: this.redondear(chequeDB.saldo, 2),
        saldo_nuevo: nuevoSaldoCheque,
        monto: this.redondear(totalCheques, 2),
        venta_propia: '',
        recibo_cobro: reciboDB._id,
        creatorUser,
        updatorUser
      }

      const nuevoMovimientoCaja = new this.cajasMovimientosModel(dataMovimientoCaja);
      await nuevoMovimientoCaja.save();


    }

    // Proximo numero de movimiento
    let nroMovimientoCC = 0;
    const ultimoCCMov = await this.ccClientesMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

    //** IMPACTO EN CUENTA CORRIENTE + MOVIMIENTOS

    const cuentaCorrienteDB = await this.ccClientesModel.findOne({ cliente: String(cliente) });

    // Impacto en saldo
    const nuevoSaldoCC = this.redondear(cuentaCorrienteDB.saldo + Number(cobro_total), 2);
    await this.ccClientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldoCC });

    // Movimiento en cuenta corriente de cliente
    nroMovimientoCC += 1;
    const dataMovimientoCC = {
      nro: nroMovimientoCC,
      tipo: 'Debe',
      descripcion: observacion,
      cc_cliente: cuentaCorrienteDB._id,
      cliente,
      saldo_anterior: this.redondear(cuentaCorrienteDB.saldo, 2),
      saldo_nuevo: nuevoSaldoCC,
      monto: this.redondear(Number(cobro_total), 2),
      venta_propia: '',
      recibo_cobro: reciboDB._id,
      creatorUser,
      updatorUser
    }

    const nuevoMovimientoCC = new this.ccClientesMovimientosModel(dataMovimientoCC);
    await nuevoMovimientoCC.save();

    //** IMPACTOS EN CAJAS + MOVIMIENTOS

    formas_pago.map(async elemento => {

      const cajaDB = await this.cajasModel.findById(elemento._id)

      // Impacto en caja
      const nuevoSaldoCaja = cajaDB.saldo + elemento.monto;
      await this.cajasModel.findByIdAndUpdate(elemento._id, { saldo: nuevoSaldoCaja });

      // Movimientos en cajas
      nroMovimientoCaja += 1;
      const dataMovimientoCaja = {
        nro: nroMovimientoCaja,
        tipo: 'Debe',
        descripcion: observacion,
        caja: cajaDB._id,
        saldo_anterior: this.redondear(cajaDB.saldo, 2),
        saldo_nuevo: nuevoSaldoCaja,
        monto: this.redondear(Number(elemento.monto), 2),
        venta_propia: '',
        recibo_cobro: reciboDB._id,
        creatorUser,
        updatorUser
      }

      const nuevoMovimientoCaja = new this.cajasMovimientosModel(dataMovimientoCaja);
      await nuevoMovimientoCaja.save();

    })

    //** GENERACION DE RECIBO DE COBRO - PDF

    // RECIBO COBRO - VENTA
    const pipeline = [];

    const idRecibo = new Types.ObjectId(reciboDB._id);
    pipeline.push({ $match: { recibo_cobro: idRecibo } })

    // Informacion de venta propia
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_propias',
        localField: 'venta_propia',
        foreignField: '_id',
        as: 'venta_propia'
      }
    }
    );

    pipeline.push({ $unwind: '$venta_propia' });

    // Ordenando datos
    const ordenar: any = {};
    ordenar['createdAt'] = -1;
    pipeline.push({ $sort: ordenar });

    // RECIBO COBRO - VENTA
    const pipelineCheques = [];

    pipelineCheques.push({ $match: { recibo_cobro: idRecibo } })

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
    const [recibo, comprobantes, chequesDB] = await Promise.all([
      this.getId(reciboDB._id),
      this.recibosCobroVentaModel.aggregate(pipeline),
      this.recibosCobroChequeModel.aggregate(pipelineCheques)
    ]);

    // ADAPTANDO COMPROBANTES

    const comprobantesPDF = [];
    let montoACobrar = 0;

    comprobantes.map(comprobante => {

      montoACobrar += comprobante.monto_cobrado;

      // Adaptando numero
      let nroComprobante: string;
      const { nro } = comprobante.venta_propia;
      if (nro <= 9) nroComprobante = 'VP000000' + String(nro);
      else if (nro <= 99) nroComprobante = 'VP00000' + String(nro);
      else if (nro <= 999) nroComprobante = 'VP0000' + String(nro);
      else if (nro <= 9999) nroComprobante = 'VP000' + String(nro);
      else if (nro <= 99999) nroComprobante = 'VP00' + String(nro);
      else if (nro <= 999999) nroComprobante = 'VP0' + String(nro);

      comprobantesPDF.push({
        fecha: comprobante.venta_propia.fecha_venta ? format(comprobante.venta_propia.fecha_venta, 'dd/MM/yyyy') : format(comprobante.venta_propia.createdAt, 'dd/MM/yyyy'),
        nro: nroComprobante,
        estado: comprobante.venta_cancelada === false ? 'PAGO PARCIAL' : 'CANCELADO',
        total_deuda: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.total_deuda)),
        pago_monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_cobrado)),
        anticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_cobrado)),
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

    recibo.formas_pago.map(elemento => {
      formasPagoPDF.push({
        descripcion: elemento.descripcion,
        monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(elemento.monto)),
      });
    });

    // GENERACION DE PDF

    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/recibo-cobro.html', 'utf-8');

    // Adaptando numero
    let mostrarNumero: string;
    const { nro }: any = recibo;
    if (nro <= 9) mostrarNumero = 'RC000000' + String(nro);
    else if (nro <= 99) mostrarNumero = 'RC00000' + String(nro);
    else if (nro <= 999) mostrarNumero = 'RC0000' + String(nro);
    else if (nro <= 9999) mostrarNumero = 'RC000' + String(nro);
    else if (nro <= 99999) mostrarNumero = 'RC00' + String(nro);
    else if (nro <= 999999) mostrarNumero = 'RC0' + String(nro);

    const data = {
      fecha: recibo.fecha_cobro ? format(recibo.fecha_cobro, 'dd/MM/yyyy') : format(recibo.createdAt, 'dd/MM/yyyy'),
      cliente: recibo.cliente['descripcion'],
      numero: mostrarNumero,
      cobro_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(recibo.cobro_total)),
      comprobantesPDF,
      formasPagoPDF,
      chequesPDF,
      anticipo: comprobantesPDF.length === 0 ? true : false,
      montoACobrar: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(montoACobrar)),
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(recibo.cobro_total)),
      flagAnticipo: (Number(recibo.cobro_total) - montoACobrar) === 0 ? false : true,
      montoAnticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(recibo.cobro_total) - montoACobrar),
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
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/recibo_cobro.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return 'Recibo generado correctamente';

  }

  // Generar PDF
  async generarPDF(dataFront: any): Promise<any> {

    // RECIBO COBRO - VENTA
    const pipeline = [];

    const idRecibo = new Types.ObjectId(dataFront.recibo);
    pipeline.push({ $match: { recibo_cobro: idRecibo } })

    // Informacion de venta propia
    pipeline.push({
      $lookup: { // Lookup
        from: 'ventas_propias',
        localField: 'venta_propia',
        foreignField: '_id',
        as: 'venta_propia'
      }
    }
    );

    pipeline.push({ $unwind: '$venta_propia' });

    // Ordenando datos
    const ordenar: any = {};
    ordenar['createdAt'] = -1;
    pipeline.push({ $sort: ordenar });

    // RECIBO COBRO - VENTA
    const pipelineCheques = [];

    pipelineCheques.push({ $match: { recibo_cobro: idRecibo } })

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
    const [recibo, comprobantes, cheques] = await Promise.all([
      this.getId(dataFront.recibo),
      this.recibosCobroVentaModel.aggregate(pipeline),
      this.recibosCobroChequeModel.aggregate(pipelineCheques)
    ]);

    // ADAPTANDO COMPROBANTES

    const comprobantesPDF = [];
    let montoACobrar = 0;

    comprobantes.map(comprobante => {

      montoACobrar += comprobante.monto_cobrado;

      // Adaptando numero
      let nroComprobante: string;
      const { nro } = comprobante.venta_propia;
      if (nro <= 9) nroComprobante = 'VP000000' + String(nro);
      else if (nro <= 99) nroComprobante = 'VP00000' + String(nro);
      else if (nro <= 999) nroComprobante = 'VP0000' + String(nro);
      else if (nro <= 9999) nroComprobante = 'VP000' + String(nro);
      else if (nro <= 99999) nroComprobante = 'VP00' + String(nro);
      else if (nro <= 999999) nroComprobante = 'VP0' + String(nro);

      comprobantesPDF.push({
        fecha: comprobante.venta_propia.fecha_venta ? format(comprobante.venta_propia.fecha_venta, 'dd/MM/yyyy') : format(comprobante.venta_propia.createdAt, 'dd/MM/yyyy'),
        nro: nroComprobante,
        estado: comprobante.venta_cancelada === false ? 'PAGO PARCIAL' : 'CANCELADO',
        total_deuda: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.total_deuda)),
        pago_monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_cobrado)),
        anticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(comprobante.monto_cobrado)),
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

    recibo.formas_pago.map(elemento => {
      formasPagoPDF.push({
        descripcion: elemento.descripcion,
        monto: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(elemento.monto)),
      });
    });

    // GENERACION DE PDF

    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/recibo-cobro.html', 'utf-8');

    // Adaptando numero
    let mostrarNumero: string;
    const { nro }: any = recibo;
    if (nro <= 9) mostrarNumero = 'RC000000' + String(nro);
    else if (nro <= 99) mostrarNumero = 'RC00000' + String(nro);
    else if (nro <= 999) mostrarNumero = 'RC0000' + String(nro);
    else if (nro <= 9999) mostrarNumero = 'RC000' + String(nro);
    else if (nro <= 99999) mostrarNumero = 'RC00' + String(nro);
    else if (nro <= 999999) mostrarNumero = 'RC0' + String(nro);

    const data = {
      fecha: recibo.fecha_cobro ? format(recibo.fecha_cobro, 'dd/MM/yyyy') : format(recibo.createdAt, 'dd/MM/yyyy'),
      cliente: recibo.cliente['descripcion'],
      numero: mostrarNumero,
      cobro_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(recibo.cobro_total)),
      comprobantesPDF,
      formasPagoPDF,
      chequesPDF,
      anticipo: comprobantesPDF.length === 0 ? true : false,
      montoACobrar: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(montoACobrar)),
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(recibo.cobro_total)),
      flagAnticipo: (Number(recibo.cobro_total) - montoACobrar) === 0 ? false : true,
      montoAnticipo: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(recibo.cobro_total) - montoACobrar),
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
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/recibo_cobro.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return '';

  }

  // Actualizar recibo
  async update(id: string, recibosCobroUpdateDTO: any): Promise<IRecibosCobro> {

    const reciboDB = await this.recibosCobroModel.findById(id);

    // Verificacion: El recibo no existe
    if (!reciboDB) throw new NotFoundException('El recibo no existe');

    const recibo = await this.recibosCobroModel.findByIdAndUpdate(id, recibosCobroUpdateDTO, { new: true });
    return recibo;

  }

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }

}
