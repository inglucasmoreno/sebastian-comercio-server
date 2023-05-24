import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add, format } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ICcProveedoresMovimientos } from 'src/cc-proveedores-movimientos/interface/cc-proveedores-movimientos.interface';
import { ICcProveedores } from 'src/cc-proveedores/interface/cc-proveedores.interface';
import { ICheques } from 'src/cheques/interface/cheques.interface';
import { IComprasCajas } from 'src/compras-cajas/interface/compras-cajas.interface';
import { IComprasCheques } from 'src/compras-cheques/interface/compras-cheques.interface';
import { IComprasProductos } from 'src/compras-productos/interface/compras-productos.interface';
import { IOrdenesPago } from 'src/ordenes-pago/interface/ordenes-pago.interface';
import { ComprasUpdateDTO } from './dto/compras-update.dto';
import { ComprasDTO } from './dto/compras.dto';
import { ICompras } from './interface/compras.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { IOrdenesPagoCompra } from 'src/ordenes-pago-compra/interface/ordenes-pago-compra.interface';
import { IProductos } from 'src/productos/interface/productos.interface';

@Injectable()
export class ComprasService {

  constructor(
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    @InjectModel('Productos') private readonly productosModel: Model<IProductos>,
    @InjectModel('ComprasProductos') private readonly comprasProductosModel: Model<IComprasProductos>,
    @InjectModel('ComprasCajas') private readonly comprasCajasModel: Model<IComprasCajas>,
    @InjectModel('ComprasCheques') private readonly comprasChequesModel: Model<IComprasCheques>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
    @InjectModel('CcProveedores') private readonly ccProveedoresModel: Model<ICcProveedores>,
    @InjectModel('CcProveedoresMovimientos') private readonly ccProveedoresMovimientosModel: Model<ICcProveedoresMovimientos>,
    @InjectModel('OrdenesPago') private readonly ordenesPagoModel: Model<IOrdenesPago>,
    @InjectModel('OrdenesPagoCompra') private readonly ordenesPagoCompraModel: Model<IOrdenesPagoCompra>,
    @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
  ) { };

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }

  // Compra por ID
  async getId(id: string): Promise<ICompras> {

    // Se verifica que la compra existe
    const compraDB = await this.comprasModel.findById(id);
    if (!compraDB) throw new NotFoundException('La compra no existe');

    const pipeline = [];

    // Compra por ID
    const idCompra = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCompra } })

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

    const compras = await this.comprasModel.aggregate(pipeline);

    return compras[0];

  }

  // Listar compras
  async getAll(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      activo,
      parametro,
      proveedor,
      cancelada
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Filtrado por proveedor
    if (proveedor && proveedor !== '') {
      const idProveedor = new Types.ObjectId(proveedor);
      pipeline.push({ $match: { proveedor: idProveedor } });
      pipelineTotal.push({ $match: { proveedor: idProveedor } });
    }

    // Filtro por compra cancelada
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

    const condicionProveedor = {
      $lookup: { // Lookup
        from: 'proveedores',
        localField: 'proveedor',
        foreignField: '_id',
        as: 'proveedor'
      }
    }

    // Informacion de proveedor
    pipeline.push(condicionProveedor);
    pipelineTotal.push(condicionProveedor);

    pipeline.push({ $unwind: '$proveedor' });
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
      pipeline.push({ $match: { $or: [{ nro: Number(parametro) }, { 'proveedor.descripcion': regex }, { nro_factura: parametro }] } });
      pipelineTotal.push({ $match: { $or: [{ nro: Number(parametro) }, { 'proveedor.descripcion': regex }, { nro_factura: parametro }] } });

    }

    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }


    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });


    const [compras, comprasTotal] = await Promise.all([
      this.comprasModel.aggregate(pipeline),
      this.comprasModel.aggregate(pipelineTotal),
    ])

    return {
      compras,
      totalItems: comprasTotal.length
    };

  }

  // Crear compra
  async insert(compraDTO: ComprasDTO): Promise<ICompras> {

    const {
      proveedor,
      fecha_compra,
      observacion,
      monto_pago,
      precio_total,
      productos,
      monto_deuda,
      nro_factura,
      formas_pago,
      cancelada,
      cheques,
      creatorUser,
      updatorUser
    } = compraDTO;

    //** VERIFICACIONES INICIALES */

    // Cheques validos al momento de pagar

    let chequeInvalido: any;

    await Promise.all(
      cheques.map( async (cheque: any) => {
        const chequeDB = await this.chequesModel.findById(cheque._id);
        if(chequeDB.estado !== 'Creado') chequeInvalido = chequeDB;
      })
    );

    if(chequeInvalido) throw new NotFoundException(`El #${chequeInvalido.nro_cheque} no esta en cartera`);

    //** 1) - CREACION DE COMPRA

    let nroCompra: number = 0;

    const compras = await this.comprasModel.find()
      .sort({ createdAt: -1 })
      .limit(1)

    compras.length === 0 ? nroCompra = 1 : nroCompra = Number(compras[0].nro + 1);

    // Adaptando fechas de compra

    const dataCompra = {
      nro: nroCompra,
      fecha_compra: add(new Date(fecha_compra), { hours: 3 }),
      nro_factura,
      proveedor,
      observacion,
      monto_deuda,
      formas_pago,
      monto_pago,
      precio_total,
      cancelada,
      creatorUser,
      updatorUser
    }

    const nuevaCompra = new this.comprasModel(dataCompra);
    const compraDB = await nuevaCompra.save();

    // Adaptando numero
    let codigoCompra: string;
    if (compraDB.nro <= 9) codigoCompra = 'C000000' + String(compraDB.nro);
    else if (compraDB.nro <= 99) codigoCompra = 'C00000' + String(compraDB.nro);
    else if (compraDB.nro <= 999) codigoCompra = 'C0000' + String(compraDB.nro);
    else if (compraDB.nro <= 9999) codigoCompra = 'C000' + String(compraDB.nro);
    else if (compraDB.nro <= 99999) codigoCompra = 'C00' + String(compraDB.nro);
    else if (compraDB.nro <= 999999) codigoCompra = 'C0' + String(compraDB.nro);

    //** 2) - RELACION PRODUCTOS - COMPRA

    productos.map(async (producto: any) => {

      const dataProducto = {
        compra: compraDB._id,
        producto: producto.producto,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario,
        precio_total: producto.precio_total,
        creatorUser,
        updatorUser
      }

      const nuevaRelacion = new this.comprasProductosModel(dataProducto);

      await Promise.all([
        nuevaRelacion.save(), // Generando relacion Producto - Compra
        this.productosModel.findByIdAndUpdate(producto.producto, { $inc: { cantidad: producto.cantidad } }) // Incrementando el stock
      ])

    });

    //** 3) - RELACION CAJAS - COMPRA

    let nroMovimientoCaja = 0;
    const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

    formas_pago.map(async (forma_pago: any) => {


      if (forma_pago._id !== 'cuenta_corriente') {

        // const dataCajas = {
        //   compra: compraDB._id,
        //   caja: forma_pago._id,
        //   monto: forma_pago.monto,
        //   creatorUser,
        //   updatorUser
        // }

        // const nuevaRelacion = new this.comprasCajasModel(dataCajas);
        // await nuevaRelacion.save();

        // Impactos sobre saldos de caja
        const cajaDB = await this.cajasModel.findById(forma_pago._id);
        const nuevoSaldo = cajaDB.saldo - forma_pago.monto;
        await this.cajasModel.findByIdAndUpdate(cajaDB._id, { saldo: nuevoSaldo });

        // Movimiento en caja
        nroMovimientoCaja += 1;
        const data = {
          nro: nroMovimientoCaja,
          descripcion: `COMPRA ${codigoCompra}`,
          tipo: 'Haber',
          caja: forma_pago._id,
          compra: String(compraDB._id),
          monto: this.redondear(forma_pago.monto, 2),
          saldo_anterior: this.redondear(cajaDB.saldo, 2),
          saldo_nuevo: this.redondear(nuevoSaldo, 2),
          creatorUser,
          updatorUser
        };

        const nuevoMovimiento = new this.cajasMovimientosModel(data);
        await nuevoMovimiento.save();

      } else { // Forma de pago === Cuenta corriente

        // Impacto en saldo de CC
        const ccProveedorDB = await this.ccProveedoresModel.findOne({ proveedor });
        const nuevoSaldoCC = ccProveedorDB.saldo - forma_pago.monto;
        await this.ccProveedoresModel.findByIdAndUpdate(ccProveedorDB._id, { saldo: nuevoSaldoCC });

        // Movimiento en CC
        let nroMovimientoCC = 0;
        const ultimoCCMov: any = await this.ccProveedoresMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
        ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

        nroMovimientoCC += 1;
        const dataMovimiento = {
          nro: nroMovimientoCC,
          descripcion: `COMPRA ${codigoCompra}`,
          tipo: 'Haber',
          cc_proveedor: String(ccProveedorDB._id),
          proveedor,
          compra: String(compraDB._id),
          monto: this.redondear(forma_pago.monto, 2),
          saldo_anterior: this.redondear(ccProveedorDB.saldo, 2),
          saldo_nuevo: this.redondear(nuevoSaldoCC, 2),
          creatorUser,
          updatorUser
        }

        const nuevoMovimiento = new this.ccProveedoresMovimientosModel(dataMovimiento);
        await nuevoMovimiento.save();

      }

    });

    //** 4) - RELACION CHEQUES - COMPRA

    let totalCheques = 0;

    // cheques.map(async (cheque: any) => {
    for( const elemento of cheques ) {

      const cheque: any = elemento;

      totalCheques += cheque.importe;

      const dataCheques = {
        compra: compraDB._id,
        cheque: cheque._id,
        creatorUser,
        updatorUser
      }

      const nuevaRelacion = new this.comprasChequesModel(dataCheques);
      await nuevaRelacion.save();

      // Actualizacion de cheques
      await this.chequesModel.findByIdAndUpdate(cheque._id, { 
        estado: 'Transferido', 
        destino: String(proveedor), 
        fecha_salida: add(new Date(fecha_compra), { hours: 3 }),
      });

    // });

    }

    if (cheques.length !== 0) {
      // Impacto sobre saldo de cheques

      const chequesID = '222222222222222222222222';

      const chequesDB = await this.cajasModel.findById(chequesID);
      const nuevoSaldoCheques = chequesDB.saldo - totalCheques;
      await this.cajasModel.findByIdAndUpdate(chequesID, { saldo: nuevoSaldoCheques });

      // Movimiento en caja
      nroMovimientoCaja += 1;
      const data = {
        nro: nroMovimientoCaja,
        descripcion: `COMPRA ${codigoCompra}`,
        tipo: 'Haber',
        caja: chequesID,
        compra: String(compraDB._id),
        monto: this.redondear(totalCheques, 2),
        saldo_anterior: this.redondear(chequesDB.saldo, 2),
        saldo_nuevo: this.redondear(nuevoSaldoCheques, 2),
        creatorUser,
        updatorUser
      };

      const nuevoMovimiento = new this.cajasMovimientosModel(data);
      await nuevoMovimiento.save();
    }


    //** 5) - SALDO A FAVOR - IMPACTO EN CUENTA CORRIENTE

    if (monto_pago > precio_total) {

      // Impacto en saldo de CC
      const ccProveedorDB = await this.ccProveedoresModel.findOne({ proveedor });
      const nuevoSaldoCC = ccProveedorDB.saldo + (monto_pago - precio_total);
      await this.ccProveedoresModel.findByIdAndUpdate(ccProveedorDB._id, { saldo: nuevoSaldoCC });

      // Movimiento en CC
      let nroMovimientoCC = 0;
      const ultimoCCMov: any = await this.ccProveedoresMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
      ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

      nroMovimientoCC += 1;
      const dataMovimiento = {
        nro: nroMovimientoCC,
        descripcion: `COMPRA ${codigoCompra}`,
        tipo: 'Debe',
        cc_proveedor: String(ccProveedorDB._id),
        proveedor,
        compra: String(compraDB._id),
        monto: this.redondear(monto_pago - precio_total, 2),
        saldo_anterior: this.redondear(ccProveedorDB.saldo, 2),
        saldo_nuevo: this.redondear(nuevoSaldoCC, 2),
        creatorUser,
        updatorUser
      }

      const nuevoMovimiento = new this.ccProveedoresMovimientosModel(dataMovimiento);
      await nuevoMovimiento.save();

    }

    //** 6) - GENERACION DE PDF
    await this.generarPDF({ compra: compraDB._id });

    return compraDB;

  }

  // Actualizar compra
  async update(id: string, comprasUpdateDTO: ComprasUpdateDTO): Promise<ICompras> {

    const { activo } = comprasUpdateDTO;

    const compraDB = await this.comprasModel.findById(id);

    // Verificacion: La compra no existe
    if (!compraDB) throw new NotFoundException('La compra no existe');

    const compra = await this.comprasModel.findByIdAndUpdate(id, comprasUpdateDTO, { new: true });
    return compra;

  }

  // Alta y Baja de compra
  async altaBaja(id: string, data: any): Promise<ICompras> {

    const { estado, creatorUser, updatorUser } = data;

    const [compraDB, productos] = await Promise.all([
      this.comprasModel.findById(id),
      this.comprasProductosModel.find({ compra: id })  // Productos de la compra
    ]);

    // Verificacion: La compra no existe
    if (!compraDB) throw new NotFoundException('La compra no existe');

    // Verificacion: Si tiene recibos de cobros asociados no puede darse de baja
    const ordenPagoDB = await this.ordenesPagoCompraModel.find({ compra: compraDB._id });
    if (ordenPagoDB.length !== 0) throw new NotFoundException('La compra tiene una orden de pago asociada');

    let condicion: any = null;
    let saldoCC: number = 0;
    let saldoCaja: number = 0;

    if (estado === 'Alta') {
      condicion = { activo: true };
    } else if (estado === 'Baja') {
      condicion = { activo: false };
    }

    // AJUSTE DE SALDOS

    compraDB.formas_pago.map(async (pago: any) => {

      let codigoCompra: string;
      const { nro } = compraDB;
      if (nro <= 9) codigoCompra = 'C000000' + String(nro);
      else if (nro <= 99) codigoCompra = 'C00000' + String(nro);
      else if (nro <= 999) codigoCompra = 'C0000' + String(nro);
      else if (nro <= 9999) codigoCompra = 'C000' + String(nro);
      else if (nro <= 99999) codigoCompra = 'C00' + String(nro);
      else if (nro <= 999999) codigoCompra = 'C0' + String(nro);


      // CAJAS VARIAS
      if (pago._id !== 'cuenta_corriente') {

        // Impacto en saldo
        const caja = await this.cajasModel.findById(pago._id);
        if (estado === 'Alta') saldoCaja = caja.saldo - pago.monto;
        else saldoCaja = caja.saldo + pago.monto;
        await this.cajasModel.findByIdAndUpdate(caja._id, { saldo: saldoCaja });

        // Generacion de movimiento

        let nroMovimientoCaja = 0;
        const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
        ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

        nroMovimientoCaja += 1;
        const dataMovimiento = {
          nro: nroMovimientoCaja,
          descripcion: estado === 'Alta' ? `ALTA DE COMPRA - ${codigoCompra}` : `BAJA DE COMPRA - ${codigoCompra}`,
          tipo: estado === 'Alta' ? 'Debe' : 'Haber',
          caja: String(caja._id),
          compra: String(compraDB._id),
          monto: this.redondear(pago.monto, 2),
          saldo_anterior: this.redondear(caja.saldo, 2),
          saldo_nuevo: estado === 'Alta' ? this.redondear(caja.saldo - pago.monto, 2) : this.redondear(caja.saldo + pago.monto, 2),
          creatorUser,
          updatorUser
        }

        const nuevoMovimiento = new this.cajasMovimientosModel(dataMovimiento);
        await nuevoMovimiento.save();

      }

      // CUENTA CORRIENTE
      if (pago._id === 'cuenta_corriente') {

        // Impacto en saldo
        const cc_proveedor = await this.ccProveedoresModel.findOne({ proveedor: compraDB.proveedor });
        if (estado === 'Alta') saldoCC = cc_proveedor.saldo - pago.monto;
        else saldoCC = cc_proveedor.saldo + pago.monto;
        await this.ccProveedoresModel.findByIdAndUpdate(cc_proveedor._id, { saldo: saldoCC });

        // Generacion de movimiento

        let nroMovimientoCC = 0;
        const ultimoCCMov: any = await this.ccProveedoresMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
        ultimoCCMov.length === 0 ? nroMovimientoCC = 0 : nroMovimientoCC = Number(ultimoCCMov[0].nro);

        nroMovimientoCC += 1;
        const dataMovimiento = {
          nro: nroMovimientoCC,
          descripcion: estado === 'Alta' ? `ALTA DE COMPRA - ${codigoCompra}` : `BAJA DE COMPRA - ${codigoCompra}`,
          tipo: estado === 'Alta' ? 'Haber' : 'Debe',
          cc_proveedor: String(cc_proveedor._id),
          proveedor: String(compraDB.proveedor),
          compra: String(compraDB._id),
          monto: this.redondear(pago.monto, 2),
          saldo_anterior: this.redondear(cc_proveedor.saldo, 2),
          saldo_nuevo: estado === 'Alta' ? this.redondear(cc_proveedor.saldo - pago.monto, 2) : this.redondear(cc_proveedor.saldo + pago.monto, 2),
          creatorUser,
          updatorUser
        }

        const nuevoMovimiento = new this.ccProveedoresMovimientosModel(dataMovimiento);
        await nuevoMovimiento.save();

      }

    });

    // CHEQUES

    let saldoCheque = 0;

    const pipelineCheques = [];

    const idCompra = new Types.ObjectId(compraDB._id);
    pipelineCheques.push({ $match: { compra: idCompra } });

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

    const cheques = await this.comprasChequesModel.aggregate(pipelineCheques);

    // RECORRIDO Y BAJA DE CHEQUES
    cheques.map(async (elemento: any) => {
      saldoCheque += elemento.cheque.importe;
      let dataCheque: any = null
      if (estado === 'Alta') dataCheque = { 
        estado: 'Creado', 
        activo: true, 
        destino: ''
      };
      else dataCheque = { 
        estado: 'Baja', 
        activo: false 
      };
      await this.chequesModel.findByIdAndUpdate(elemento.cheque._id, dataCheque);
    });

    if (saldoCheque) {
      const cajaCheque = await this.cajasModel.findById('222222222222222222222222');
      if (estado === 'Alta') saldoCheque = cajaCheque.saldo + saldoCheque;
      else saldoCheque = cajaCheque.saldo - saldoCheque;
      await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: saldoCheque });
    }

    // Ajuste de stock
    productos.map( async producto => {
      if(estado === 'Alta'){
        await this.productosModel.findByIdAndUpdate(producto.producto, { $inc: { cantidad: producto.cantidad } }) // Incrementando stock
      }else{
        await this.productosModel.findByIdAndUpdate(producto.producto, { $inc: { cantidad: -producto.cantidad } }) // Decrementando stock
      }
    })

    // Generando movimientos
    const compra = await this.comprasModel.findByIdAndUpdate(id, condicion, { new: true });
    return compra;

  }

  // Generar PDF
  async generarPDF(dataFront: any): Promise<any> {

    const pipeline: any = [];

    // Relacion por ID
    const idCompra = new Types.ObjectId(dataFront.compra);
    pipeline.push({ $match: { compra: idCompra } });

    // Informacion de producto
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

    // Busqueda de productos de la compra

    const pipelineProductos: any = [];
    pipelineProductos.push({ $match: { compra: idCompra } });
    
    // Informacion de producto
    pipelineProductos.push({
      $lookup: { // Lookup
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    }
    );

    pipelineProductos.push({ $unwind: '$producto' });

    // Informacion de unidad de medida
    pipelineProductos.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'producto.unidad_medida',
        foreignField: '_id',
        as: 'producto.unidad_medida'
      }
    }
    );

    pipelineProductos.push({ $unwind: '$producto.unidad_medida' });    

    // Promisa ALL
    const [compra, productos, relaciones] = await Promise.all([
      this.getId(dataFront.compra),
      this.comprasProductosModel.aggregate(pipelineProductos),
      this.comprasChequesModel.aggregate(pipeline)
    ]);

    let html: any;

    html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/compra.html', 'utf-8');

    let productosPDF: any[] = [];
    let formasPagoPDF: any[] = [];

    // Adaptando productos
    productos.map((producto: any) => productosPDF.push({
      descripcion: producto.producto.descripcion,
      cantidad: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.cantidad),
      unidad_medida: producto.producto.unidad_medida.descripcion,
      precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
      precio_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_total)
    }));

    // Adaptando numero
    let mostrarNumero: string;
    const { nro } = compra;
    if (nro <= 9) mostrarNumero = 'C000000' + String(nro);
    else if (nro <= 99) mostrarNumero = 'C00000' + String(nro);
    else if (nro <= 999) mostrarNumero = 'C0000' + String(nro);
    else if (nro <= 9999) mostrarNumero = 'C000' + String(nro);
    else if (nro <= 99999) mostrarNumero = 'C00' + String(nro);
    else if (nro <= 999999) mostrarNumero = 'C0' + String(nro);

    // Adaptando formas de pago
    compra.formas_pago.map((forma: any) => formasPagoPDF.push({
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
      fecha: compra.fecha_compra ? format(compra.fecha_compra, 'dd/MM/yyyy') : format(compra.createdAt, 'dd/MM/yyyy'),
      numero: mostrarNumero,
      nro_factura: compra.nro_factura,
      descripcion: compra.proveedor['descripcion'],
      formas_pago: formasPagoPDF,
      correo_electronico: compra.proveedor['correo_electronico'],
      condicion_iva: compra.proveedor['condicion_iva'],
      direccion: compra.proveedor['direccion'],
      telefono: compra.proveedor['telefono'],
      productos: productosPDF,
      total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(compra.precio_total)
    };

    console.log(data);

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
                    <p style="width: 100%; font-size: 8px;"> ${compra.observacion} </p>
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
      path: (process.env.PUBLIC_DIR || './public') + '/pdf/compra.pdf'
    }

    // Generacion de PDF
    await pdf.create(document, options);

    return '';

  }


}
