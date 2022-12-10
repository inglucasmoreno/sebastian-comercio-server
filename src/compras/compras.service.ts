import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ICcProveedoresMovimientos } from 'src/cc-proveedores-movimientos/interface/cc-proveedores-movimientos.interface';
import { ICcProveedores } from 'src/cc-proveedores/interface/cc-proveedores.interface';
import { IComprasCajas } from 'src/compras-cajas/interface/compras-cajas.interface';
import { IComprasCheques } from 'src/compras-cheques/interface/compras-cheques.interface';
import { IComprasProductos } from 'src/compras-productos/interface/compras-productos.interface';
import { ComprasUpdateDTO } from './dto/compras-update.dto';
import { ComprasDTO } from './dto/compras.dto';
import { ICompras } from './interface/compras.interface';

@Injectable()
export class ComprasService {

  constructor(
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
    @InjectModel('ComprasProductos') private readonly comprasProductosModel: Model<IComprasProductos>,
    @InjectModel('ComprasCajas') private readonly comprasCajasModel: Model<IComprasCajas>,
    @InjectModel('ComprasCheques') private readonly comprasChequesModel: Model<IComprasCheques>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
    @InjectModel('CcProveedores') private readonly ccProveedoresModel: Model<ICcProveedores>,
    @InjectModel('CcProveedoresMovimientos') private readonly ccProveedoresMovimientosModel: Model<ICcProveedoresMovimientos>,
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
  async getAll(querys: any): Promise<ICompras[]> {

    const { columna, direccion } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

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

    const compras = await this.comprasModel.aggregate(pipeline);

    return compras;

  }

  // Crear compra
  async insert(compraDTO: ComprasDTO): Promise<ICompras> {

    const {
      proveedor,
      monto_pago,
      precio_total,
      productos,
      formas_pago,
      cheques,
      creatorUser,
      updatorUser
    } = compraDTO;

    // 1) - CREACION DE COMPRA

    let nroCompra: number = 0;

    const compras = await this.comprasModel.find()
      .sort({ createdAt: -1 })
      .limit(1)

    compras.length === 0 ? nroCompra = 1 : nroCompra = Number(compras[0].nro + 1);

    const dataCompra = {
      ...compraDTO,
      nro: nroCompra
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

    // 2) - RELACION PRODUCTOS - COMPRA

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
      await nuevaRelacion.save();

    });

    // 3) - RELACION CAJAS - COMPRA

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

    // 4) - RELACION CHEQUES - COMPRA

    let totalCheques = 0;

    cheques.map(async (cheque: any) => {

      totalCheques += cheque.importe;

      const dataCheques = {
        compra: compraDB._id,
        cheque: cheque._id,
        creatorUser,
        updatorUser
      }

      const nuevaRelacion = new this.comprasChequesModel(dataCheques);
      await nuevaRelacion.save();

    });

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


    // 5) - SALDO A FAVOR - IMPACTO EN CUENTA CORRIENTE

    if(monto_pago > precio_total){
     
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

}
