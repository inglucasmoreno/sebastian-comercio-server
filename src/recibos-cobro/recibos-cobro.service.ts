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
import { RecibosCobroDTO } from './dto/recibos-cobro.dto';
import { IRecibosCobro } from './interface/recibos-cobro.interface';

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
    pipelineTotal.push({$match:{}});

    // Activo / Inactivo
    let filtroActivo = {};
    if(activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({$match: filtroActivo});
      pipelineTotal.push({$match: filtroActivo});
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
		if(parametro && parametro !== ''){
			
      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for(var i = 0; i < porPartes.length; i++){
        if(i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal,'i');
      pipeline.push({$match: { $or: [ { nro: Number(parametro) }, { 'cliente.descripcion': regex } ] }});
			pipelineTotal.push({$match: { $or: [ { nro: Number(parametro) }, { 'cliente.descripcion': regex } ] }});
      
		}

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    const [ recibos, recibosTotal ] = await Promise.all([
      this.recibosCobroModel.aggregate(pipeline),
      this.recibosCobroModel.aggregate(pipelineTotal),
    ])

    return {
      recibos,
      totalItems: recibosTotal.length
    };

  }

  // Crear recibo de cobro
  async insert(recibosCobrosDTO: RecibosCobroDTO): Promise<any> {

    const {
      cliente,
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
      formas_pago,
      cobro_total,
      creatorUser,
      updatorUser
    }

    const nuevoRecibo = new this.recibosCobroModel(dataRecibo);
    const reciboDB = await nuevoRecibo.save();

    // Codigo de recibo
    let codigoRecibo: string;
    if (reciboDB.nro <= 9) codigoRecibo = 'RC000000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 99) codigoRecibo = 'RC00000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 999) codigoRecibo = 'RC0000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 9999) codigoRecibo = 'RC000' + String(reciboDB.nro);
    else if (reciboDB.nro <= 99999) codigoRecibo = 'RC00' + String(reciboDB.nro);
    else if (reciboDB.nro <= 999999) codigoRecibo = 'RC0' + String(reciboDB.nro);

    //** RELACION RECIBOS - VENTAS

    // RECIBO -> VENTAS
    carro_pago.map(async elemento => {

      const dataReciboVenta = {
        recibo_cobro: reciboDB._id,
        venta_propia: elemento.venta,
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

    //** IMPACTOS EN CAJA - CHEQUES
    if (cheques.length !== 0) {

      const chequeDB = await this.cajasModel.findById('222222222222222222222222');
      const nuevoSaldoCheque = this.redondear(chequeDB.saldo + totalCheques, 2);
      await this.cajasModel.findByIdAndUpdate(chequeDB._id, { saldo: nuevoSaldoCheque });
    
      // Movimientos en cajas
      const dataMovimientoCaja = {
        tipo: 'Debe',
        descripcion: `COBRO ${codigoRecibo}`,
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

    //** IMPACTO EN CUENTA CORRIENTE + MOVIMIENTOS

    // Impacto en saldo
    const cuentaCorrienteDB = await this.ccClientesModel.findOne({ cliente: String(cliente) });
    const nuevoSaldoCC = this.redondear(cuentaCorrienteDB.saldo + Number(cobro_total), 2);
    await this.ccClientesModel.findByIdAndUpdate(cuentaCorrienteDB._id, { saldo: nuevoSaldoCC });

    // Movimiento en cuenta corriente de cliente
    const dataMovimientoCC = {
      tipo: 'Debe',
      descripcion: `COBRO ${codigoRecibo}`,
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

    //** IMPACTOS EN CAJAS

    formas_pago.map(async elemento => {

      // Impacto en saldos
      const cajaDB = await this.cajasModel.findById(elemento._id);
      const nuevoSaldoCaja = cajaDB.saldo + elemento.monto;
      await this.cajasModel.findByIdAndUpdate(elemento._id, { saldo: nuevoSaldoCaja });

      // Movimientos en cajas
      const dataMovimientoCaja = {
        tipo: 'Debe',
        descripcion: `COBRO ${codigoRecibo}`,
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

    return 'Recibo generado correctamente';

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
