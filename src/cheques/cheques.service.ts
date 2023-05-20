import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { IProveedores } from 'src/proveedores/interface/proveedores.interface';
import { ChequesUpdateDTO } from './dto/cheques-update';
import { ChequesDTO } from './dto/cheques.dto';
import { ICheques } from './interface/cheques.interface';
import { IComprasCheques } from 'src/compras-cheques/interface/compras-cheques.interface';
import { IVentasPropiasCheques } from 'src/ventas-propias-cheques/interface/ventas-propias-cheques.interface';
import { IOrdenesPagoCheques } from 'src/ordenes-pago-cheques/interface/ordenes-pago-cheques.interface';
import { IRecibosCobroCheque } from 'src/recibos-cobro-cheque/interface/recibos-cheque.interface';
import { IRecibosCobroVenta } from 'src/recibos-cobro-venta/interface/recibos-cobro-venta.interface';
import { IOrdenesPagoCompra } from 'src/ordenes-pago-compra/interface/ordenes-pago-compra.interface';

@Injectable()
export class ChequesService {

  constructor(
    @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
    @InjectModel('Proveedores') private readonly proveedoresModel: Model<IProveedores>,
    @InjectModel('comprasCheques') private readonly comprasChequesModel: Model<IComprasCheques>,
    @InjectModel('ventasPropiasCheques') private readonly ventasPropiasChequesModel: Model<IVentasPropiasCheques>,
    @InjectModel('ordenesPagoCheques') private readonly ordenesPagoChequesModel: Model<IOrdenesPagoCheques>,
    @InjectModel('recibosCobroCheques') private readonly recibosCobroChequesModel: Model<IRecibosCobroCheque>,
    @InjectModel('recibosCobroVenta') private readonly recibosCobroVentaModel: Model<IRecibosCobroVenta>,
    @InjectModel('ordenesPagoCompra') private readonly ordenesPagoCompraModel: Model<IOrdenesPagoCompra>,
  ) { };

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }

  // Cheques por ID
  async getId(id: string): Promise<any> {

    // Se verifica si el cheque existe
    const chequeDB = await this.chequesModel.findById(id);
    if (!chequeDB) throw new NotFoundException('El cheque no existe');

    const pipeline = [];

    // Cheque por ID
    const idCheque = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCheque } })

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'banco',
        foreignField: '_id',
        as: 'banco'
      }
    }
    );

    pipeline.push({ $unwind: '$banco' });

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

    const cheque = await this.chequesModel.aggregate(pipeline);

    let destino = null;
    let destino_caja = null;

    if (cheque[0].destino && cheque[0].destino.trim() !== '') {
      destino = await this.proveedoresModel.findById(cheque[0].destino);
    }

    if (cheque[0].destino_caja && cheque[0].destino_caja.trim() !== '') {
      destino_caja = await this.cajasModel.findById(cheque[0].destino_caja);
    }

    return {
      cheque: cheque[0],
      destino,
      destino_caja
    }

  }

  // Listar de relaciones
  async getRelaciones(id: string): Promise<any> {

    const idCheque = new Types.ObjectId(id);

    // --> Relacion con compra
    const pipelineCompra = [];
    pipelineCompra.push({ $match: { cheque: idCheque } });

    // Informacion de la venta
    pipelineCompra.push({
      $lookup: { // Lookup
        from: 'compras',
        localField: 'compra',
        foreignField: '_id',
        as: 'compra'
      }
    }
    );
    pipelineCompra.push({ $unwind: '$compra' });

    // --> Relacion con venta
    const pipelineVenta = [];
    pipelineVenta.push({ $match: { cheque: idCheque } });

    // Informacion de la venta
    pipelineVenta.push({
      $lookup: { // Lookup
        from: 'ventas_propias',
        localField: 'venta_propia',
        foreignField: '_id',
        as: 'venta_propia'
      }
    }
    );
    pipelineVenta.push({ $unwind: '$venta_propia' });

    // Relacion -> orden de pago
    const pipelineOrdenesPago = [];
    pipelineOrdenesPago.push({ $match: { cheque: idCheque } });

    // Informacion de la orden de pago
    pipelineOrdenesPago.push({
      $lookup: { // Lookup
        from: 'ordenes_pago',
        localField: 'orden_pago',
        foreignField: '_id',
        as: 'orden_pago'
      }
    }
    );
    pipelineOrdenesPago.push({ $unwind: '$orden_pago' });

    // Relacion -> recibo de cobro
    const pipelineRecibosCobro = [];
    pipelineRecibosCobro.push({ $match: { cheque: idCheque } });

    // Informacion del recibo de cobro
    pipelineRecibosCobro.push({
      $lookup: { // Lookup
        from: 'recibos_cobros',
        localField: 'recibo_cobro',
        foreignField: '_id',
        as: 'recibo_cobro'
      }
    }
    );
    pipelineRecibosCobro.push({ $unwind: '$recibo_cobro' });

    const [chequeVenta, chequeCompra, chequeOrdenPago, chequeReciboCobro] = await Promise.all<any>([
      this.ventasPropiasChequesModel.aggregate(pipelineVenta),
      this.comprasChequesModel.aggregate(pipelineCompra),
      this.ordenesPagoChequesModel.aggregate(pipelineOrdenesPago),
      this.recibosCobroChequesModel.aggregate(pipelineRecibosCobro),
    ])

    let ventaPropia = chequeVenta[0] ? chequeVenta[0].venta_propia : null;
    let compra = chequeCompra[0] ? chequeCompra[0].compra : null;
    let ordenPago = chequeOrdenPago[0] ? chequeOrdenPago[0].orden_pago : null;
    let reciboCobro = chequeReciboCobro[0] ? chequeReciboCobro[0].recibo_cobro : null;

    // Obtener venta propia desde recibo de cobro
    if(chequeReciboCobro[0]){

      const pipelineTMP = [];
      pipelineTMP.push({ $match: { recibo_cobro: chequeReciboCobro[0].recibo_cobro._id } });
  
      // Informacion del recibo de cobro
      pipelineTMP.push({
        $lookup: { // Lookup
          from: 'ventas_propias',
          localField: 'venta_propia',
          foreignField: '_id',
          as: 'venta_propia'
        }
      }
      );
      pipelineTMP.push({ $unwind: '$venta_propia' });

      const relacionTMP: any = await this.recibosCobroVentaModel.aggregate(pipelineTMP);
      ventaPropia = relacionTMP[0].venta_propia;

    }

    // Obtener compra desde orden de pago
    if(chequeOrdenPago[0]){
      
      const pipelineTMP = [];
      pipelineTMP.push({ $match: { orden_pago: chequeOrdenPago[0].orden_pago._id } });
  
      // Informacion de la orden de pago
      pipelineTMP.push({
        $lookup: { // Lookup
          from: 'compras',
          localField: 'compra',
          foreignField: '_id',
          as: 'compra'
        }
      }
      );
      pipelineTMP.push({ $unwind: '$compra' });

      const relacionTMP: any = await this.ordenesPagoCompraModel.aggregate(pipelineTMP);
      compra = relacionTMP[0].compra;
    
    }

    return {
      ventaPropia,
      compra,
      ordenPago,
      reciboCobro,
    };

  }

  // Listar cheques
  async getAll(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      estado,
      parametro,
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Por estado
    if (estado && estado !== '') {
      pipeline.push({ $match: { estado } });
      pipelineTotal.push({ $match: { estado } });
    }

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'banco',
        foreignField: '_id',
        as: 'banco'
      }
    }
    );

    pipeline.push({ $unwind: '$banco' });

    // Informacion de banco - TOTAL
    pipelineTotal.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'banco',
        foreignField: '_id',
        as: 'banco'
      }
    }
    );

    pipelineTotal.push({ $unwind: '$banco' });

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
      pipeline.push({ $match: { $or: [{ nro_cheque: regex }, { emisor: regex }, { 'banco.descripcion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ nro_cheque: regex }, { emisor: regex }, { 'banco.descripcion': regex }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [cheques, chequesTotal] = await Promise.all([
      this.chequesModel.aggregate(pipeline),
      this.chequesModel.aggregate(pipelineTotal),
    ])

    // Total en cheques
    let montoTotal = 0;
    chequesTotal.map(cheque => montoTotal += cheque.importe);

    return {
      cheques,
      totalItems: chequesTotal.length,
      montoTotal
    };

  }

  // Crear cheque
  async insert(chequesDTO: ChequesDTO): Promise<ICheques> {

    const {
      nro_cheque,
      emisor,
      importe,
      banco,
      fecha_cobro,
      creatorUser,
      updatorUser
    } = chequesDTO;

    const data = {
      nro_cheque,
      importe: this.redondear(importe, 2),
      emisor,
      banco,
      fecha_cobro: add(new Date(fecha_cobro), { hours: 3 }), // Fecha +3 horas
      creatorUser,
      updatorUser
    }

    // Nuevo cheque
    const nuevoCheque = new this.chequesModel(data);
    const chequeRes = await nuevoCheque.save();

    // Impacto en Caja - Cheques
    const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
    const nuevoSaldo = this.redondear(cajaChequeDB.saldo + importe, 2);
    await this.cajasModel.findByIdAndUpdate(cajaChequeDB._id, { saldo: nuevoSaldo });

    return chequeRes;

  }

  // Actualizar cheque
  async update(id: string, chequesUpdateDTO: ChequesUpdateDTO): Promise<ICheques> {

    const {
      importe,
      fecha_cobro,
      caja,
      updatorUser
    } = chequesUpdateDTO;

    const chequeDB = await this.chequesModel.findById(id);

    // Verificacion: El cheque no existe
    if (!chequeDB) throw new NotFoundException('El cheque no existe');

    const data: any = chequesUpdateDTO;

    if (fecha_cobro) data.fecha_cobro = add(new Date(fecha_cobro), { hours: 3 });
    if (importe) data.importe = this.redondear(importe, 2);

    if (chequeDB.estado === 'Creado' && data.estado === 'Cobrado') { // Se cobra el cheque

      data.fecha_salida = new Date();

      // Impacto en saldo de caja -> CHEQUES y EFECTIVO
      const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
      const nuevoSaldoCheque = cajaChequeDB.saldo - chequeDB.importe;
      await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: nuevoSaldoCheque });


      const cajaDestinoDB = await this.cajasModel.findById(caja);
      const nuevoSaldoDestino = cajaDestinoDB.saldo + chequeDB.importe;
      await this.cajasModel.findByIdAndUpdate(caja, { saldo: nuevoSaldoDestino });

      // Movimientos -> En CHEQUES y DESTINO

      const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);

      // Proximo numero de movimiento
      let nroCaja = 0;
      ultimoCajaMov.length === 0 ? nroCaja = 1 : nroCaja = Number(ultimoCajaMov[0].nro + 1);

      const dataMovimientoCheque = {
        nro: nroCaja,
        descripcion: `COBRO DE CHEQUE #${chequeDB.nro_cheque}`,
        tipo: 'Haber',
        caja: '222222222222222222222222',
        monto: chequeDB.importe,
        saldo_anterior: cajaChequeDB.saldo,
        saldo_nuevo: nuevoSaldoCheque,
        venta_propia: '',
        recibo_cobro: '',
        cheque: chequeDB._id,
        observacion: `CHEQUES -> ${cajaDestinoDB.descripcion}`,
        creatorUser: updatorUser,
        updatorUser
      }

      const dataMovimientoDestino = {
        nro: nroCaja + 1,
        descripcion: `COBRO DE CHEQUE #${chequeDB.nro_cheque}`,
        tipo: 'Debe',
        caja,
        monto: chequeDB.importe,
        saldo_anterior: cajaDestinoDB.saldo,
        saldo_nuevo: nuevoSaldoDestino,
        venta_propia: '',
        recibo_cobro: '',
        cheque: chequeDB._id,
        observacion: `CHEQUES -> ${cajaDestinoDB.descripcion}`,
        creatorUser: updatorUser,
        updatorUser
      }

      const nuevoMovimientoCheque = new this.cajasMovimientosModel(dataMovimientoCheque);
      await nuevoMovimientoCheque.save()

      const nuevoMovimientoDestino = new this.cajasMovimientosModel(dataMovimientoDestino);
      await nuevoMovimientoDestino.save()

    }

    const cheque = await this.chequesModel.findByIdAndUpdate(id, data, { new: true });
    return cheque;

  }

  // Eliminar cheque
  async delete(id: string): Promise<ICheques> {

    const chequeDB = await this.chequesModel.findById(id);

    // Verificacion: El cheque no existe
    if (!chequeDB) throw new NotFoundException('El cheque no existe');

    // Impacto en Caja - Cheques
    const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
    const nuevoSaldo = cajaChequeDB.saldo - chequeDB.importe;
    await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: nuevoSaldo });

    const cheque = await this.chequesModel.findByIdAndDelete(id);
    return cheque;

  }

}
