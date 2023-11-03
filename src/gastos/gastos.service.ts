import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { GastosUpdateDTO } from './dto/gastos-update.dto';
import { GastosDTO } from './dto/gastos.dto';
import { IGastos } from './interface/gastos.interface';

@Injectable()
export class GastosService {

  constructor(
    @InjectModel('Gastos') private readonly gastosModel: Model<IGastos>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
  ) { };

  // Gasto por ID
  async getId(id: string): Promise<IGastos> {

    // Se verifica que el gasto existe
    const gastoDB = await this.gastosModel.findById(id);
    if (!gastoDB) throw new NotFoundException('El gasto no existe');

    const pipeline = [];

    // Gasto por ID
    const idGasto = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idGasto } })

    // Informacion de cajas
    pipeline.push({
      $lookup: { // Lookup
        from: 'cajas',
        localField: 'caja',
        foreignField: '_id',
        as: 'caja'
      }
    }
    );

    pipeline.push({ $unwind: '$caja' });

    // Informacion de tipo de gasto
    pipeline.push({
      $lookup: { // Lookup
        from: 'tipos_gastos',
        localField: 'tipo_gasto',
        foreignField: '_id',
        as: 'tipo_gasto'
      }
    }
    );

    pipeline.push({ $unwind: '$tipo_gasto' });

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

    const gasto = await this.gastosModel.aggregate(pipeline);

    return gasto[0];

  }

  // Listar gastos
  async getAll(querys: any): Promise<any> {

    const {
      columna,
      direccion,
      desde,
      registerpp,
      creatorUser,
      activo,
      parametro,
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    // Filtro por usuario creador
    if (creatorUser && creatorUser !== '') {
      const idUsuario = new Types.ObjectId(creatorUser);
      pipeline.push({ $match: { creatorUser: idUsuario } });
      pipelineTotal.push({ $match: { creatorUser: idUsuario } });
    }else{
      pipeline.push({ $match: {} });
      pipelineTotal.push({ $match: {} });
    }
    
    // Activo / Inactivo
    let filtroActivo = {};
    if (activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({ $match: filtroActivo });
      pipelineTotal.push({ $match: filtroActivo });
    }

    // Filtro por parametros
    if (parametro && parametro !== '') {

      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for (var i = 0; i < porPartes.length; i++) {
        if (i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal, 'i');
      pipeline.push({ $match: { $or: [{ numero: Number(parametro) }, { 'observacion': regex }] } });
      pipelineTotal.push({ $match: { $or: [{ numero: Number(parametro) }, { 'observacion': regex }] } });

    }

    // Informacion de cajas
    pipeline.push({
      $lookup: { // Lookup
        from: 'cajas',
        localField: 'caja',
        foreignField: '_id',
        as: 'caja'
      }
    }
    );

    pipeline.push({ $unwind: '$caja' });

    // Informacion de tipo de gasto
    pipeline.push({
      $lookup: { // Lookup
        from: 'tipos_gastos',
        localField: 'tipo_gasto',
        foreignField: '_id',
        as: 'tipo_gasto'
      }
    }
    );

    pipeline.push({ $unwind: '$tipo_gasto' });

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

    // Paginacion
    pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

    const [gastos, gastosTotal] = await Promise.all([
      this.gastosModel.aggregate(pipeline),
      this.gastosModel.aggregate(pipelineTotal),
    ])

    return {
      gastos,
      totalItems: gastosTotal.length
    };

  }

  // Crear gasto
  async insert(gastosDTO: GastosDTO): Promise<IGastos> {

    const {
      fecha_gasto,
      caja,
      monto,
      tipo_gasto,
      observacion,
      creatorUser,
      updatorUser
    } = gastosDTO;

    // Verificacion de saldo
    const cajaDB = await this.cajasModel.findById(caja);
    const saldoCaja = cajaDB.saldo;

    if (saldoCaja < monto) throw new NotFoundException('El gasto no puede exceder el saldo de caja');

    // NRO DE GASTO

    let nroGasto: number = 0;

    const gastos: any = await this.gastosModel.find()
      .sort({ createdAt: -1 })
      .limit(1)


    gastos.length === 0 ? nroGasto = 1 : nroGasto = Number(gastos[0].numero + 1);

    const dataGasto = {
      numero: nroGasto,
      fecha_gasto: add(new Date(fecha_gasto), { hours: 3 }),
      caja,
      tipo_gasto,
      monto,
      observacion,
      creatorUser,
      updatorUser
    }

    const nuevoGasto = new this.gastosModel(dataGasto);
    const gastoDB: any = await nuevoGasto.save()

    // Datos completos de gasto
    const gastoDBCompleto: any = await this.getId(gastoDB._id);

    // Impacto en caja
    const nuevoSaldo = saldoCaja - monto;
    await this.cajasModel.findByIdAndUpdate(caja, { saldo: nuevoSaldo });

    // Generacion de movimiento

    // Proximo numero de movimiento - MOVIMIENTOS DE CAJA
    let nroMovimientoCaja = 0;
    const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

    const dataMovimiento = {
      nro: nroMovimientoCaja + 1,
      descripcion: `GASTO - ${gastoDBCompleto.tipo_gasto.descripcion}`,
      tipo: 'Haber',
      caja,
      gasto: String(gastoDB._id),
      monto: this.redondear(monto, 2),
      saldo_anterior: this.redondear(cajaDB.saldo, 2),
      saldo_nuevo: this.redondear(nuevoSaldo, 2),
      creatorUser,
      updatorUser
    }; 

    const nuevoMovimiento = new this.cajasMovimientosModel(dataMovimiento);
    await nuevoMovimiento.save();

    return gastoDB;

  }

  // Actualizar gasto
  async update(id: string, gastosUpdateDTO: GastosUpdateDTO): Promise<IGastos> {

    const gastoDB = await this.gastosModel.findById(id);

    // Verificacion: El gasto no existe
    if (!gastoDB) throw new NotFoundException('El gasto no existe');

    const gasto = await this.gastosModel.findByIdAndUpdate(id, gastosUpdateDTO, { new: true });
    return gasto;

  }

  // Alta/Baja de gasto
  async altaBaja(id: string, data: any): Promise<IGastos> {

    const { activo, creatorUser, updatorUser } = data;

    const gastoDB = await this.gastosModel.findById(id);

    // Verificacion: El gasto no existe
    if (!gastoDB) throw new NotFoundException('El gasto no existe');

    // Datos de caja
    const cajaDB = await this.cajasModel.findById(gastoDB.caja);

    let nuevoSaldo = 0;


    if(!activo){ // Baja de gasto
      nuevoSaldo = cajaDB.saldo + gastoDB.monto;
    }

    if(activo){ // Alta de gasto
      nuevoSaldo = cajaDB.saldo - gastoDB.monto; 
    }
    
    // Impacto sobre caja
    await this.cajasModel.findByIdAndUpdate(cajaDB._id, { saldo: nuevoSaldo });

    // Proximo numero de movimiento - MOVIMIENTOS DE CAJA
    let nroMovimientoCaja = 0;
    const ultimoCajaMov = await this.cajasMovimientosModel.find().sort({ createdAt: -1 }).limit(1);
    ultimoCajaMov.length === 0 ? nroMovimientoCaja = 0 : nroMovimientoCaja = Number(ultimoCajaMov[0].nro);

    const dataMovimiento = {
      nro: nroMovimientoCaja + 1,
      descripcion: !activo ? `BAJA GASTO - Nro ${gastoDB.numero}` : `ALTA GASTO - Nro ${gastoDB.numero}`,
      tipo: !activo ? 'Debe' : 'Haber',
      caja: gastoDB.caja,
      gasto: String(gastoDB._id),
      monto: this.redondear(gastoDB.monto, 2),
      saldo_anterior: this.redondear(cajaDB.saldo, 2),
      saldo_nuevo: this.redondear(nuevoSaldo, 2),
      creatorUser,
      updatorUser
    }; 

    const nuevoMovimiento = new this.cajasMovimientosModel(dataMovimiento);
    await nuevoMovimiento.save();

    // Se actualiza el estado del gasto
    const gasto = await this.gastosModel.findByIdAndUpdate(id, { activo }, { new: true });
    return gasto;

  }

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }


}
