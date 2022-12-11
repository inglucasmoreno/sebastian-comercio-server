import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICcClientes } from 'src/cc-clientes/interface/cc-clientes.interface';
import { CcClientesMovimientosUpdateDTO } from './dto/cc-clientes-movimientos-update.dto';
import { CcClientesMovimientosDTO } from './dto/cc-clientes-movimientos.dto';
import { ICcClientesMovimientos } from './interface/cc-clientes-movimientos.interface';

@Injectable()
export class CcClientesMovimientosService {

  constructor(
    @InjectModel('CcClientesMovimientos') private readonly movimientosModel: Model<ICcClientesMovimientos>,
    @InjectModel('CcClientes') private readonly cuentaCorrienteModel: Model<ICcClientes>
  ){};

  // Funcion para redondeo
  redondear(numero:number, decimales:number):number {
  
    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));
  
  }

  // Movimientos por ID
  async getId(id: string): Promise<ICcClientesMovimientos> {
    
    // Se verifica que el movimiento existe
    const movimientoDB = await this.movimientosModel.findById(id);
    if(!movimientoDB) throw new NotFoundException('El movimiento no existe'); 

    const pipeline = [];

    // Informacion de cuenta corriente
    pipeline.push({
      $lookup: { // Lookup
          from: 'cc_clientes',
          localField: '',
          foreignField: '_id',
          as: 'cc_cliente'
      }}
    );

    pipeline.push({ $unwind: '$cc_cliente' });

    // Movimiento por ID
    const idMovimiento = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idMovimiento} }) 

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
          from: 'clientes',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente'
      }}
    );

    pipeline.push({ $unwind: '$cliente' });


    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'creatorUser',
          foreignField: '_id',
          as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'updatorUser',
          foreignField: '_id',
          as: 'updatorUser'
      }}
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const movimiento = await this.movimientosModel.aggregate(pipeline);
    
    return movimiento[0];    

  }

  // Listar movimientos
  async getAll(querys: any): Promise<any> {
        
    const {
      columna,
      direccion,
      desde,
      registerpp,
      activo,
      parametro,
      cc_cliente
    } = querys;

    console.log(parametro);

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({$match:{}});
    pipelineTotal.push({$match:{}});

    // Filtro por cuenta corriente
    if(cc_cliente && cc_cliente.trim() !== ''){
      const idCuentaCorriente = new Types.ObjectId(cc_cliente);
      pipeline.push({ $match:{ cc_cliente: idCuentaCorriente } });
      pipelineTotal.push({ $match:{ cc_cliente: idCuentaCorriente } }); 
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
      pipeline.push({ $match: { $or: [ { nro: Number(parametro) }, { descripcion: regex } ] } });
      pipelineTotal.push({ $match: { $or: [ { nro: Number(parametro) }, { descripcion: regex } ] } });

    }

    // Informacion de cuenta corriente
    pipeline.push({
      $lookup: { // Lookup
          from: 'cc_clientes',
          localField: 'cc_cliente',
          foreignField: '_id',
          as: 'cc_cliente'
      }}
    );

    pipeline.push({ $unwind: '$cc_cliente' });

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
          from: 'clientes',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente'
      }}
    );

    pipeline.push({ $unwind: '$cliente' });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'usuarios',
          localField: 'creatorUser',
          foreignField: '_id',
          as: 'creatorUser'
      }}
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }}
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

    const [movimientos, movimientosTotal] = await Promise.all([
      this.movimientosModel.aggregate(pipeline),
      this.movimientosModel.aggregate(pipelineTotal),
    ])
    
    return {
      movimientos,
      totalItems: movimientosTotal.length
    };  

  }    

  // Crear movimientos
  async insert(movimientosDTO: CcClientesMovimientosDTO): Promise<any> {

    const { cc_cliente, monto ,tipo } = movimientosDTO;

    // Calculo de saldos - Cuenta corriente
    const cuentaCorriente = await this.cuentaCorrienteModel.findById(cc_cliente);

    const saldo_anterior = cuentaCorriente.saldo;
    const saldo_nuevo = tipo === 'Haber' ? saldo_anterior - monto : saldo_anterior + monto;

    const data = {
      ...movimientosDTO, 
      saldo_anterior: this.redondear(saldo_anterior, 2), 
      saldo_nuevo: this.redondear(saldo_nuevo, 2)
    };

    // Actualizacion de saldo - Cuenta corriente
    await this.cuentaCorrienteModel.findByIdAndUpdate(cc_cliente, { 
      saldo: this.redondear(saldo_nuevo, 2) 
    });

    // Generacion de nuevo movimiento
    const nuevoMovimiento = new this.movimientosModel(data);
    await nuevoMovimiento.save();
    
    return { saldo_nuevo };

  }  

  // Actualizar movimientos
  async update(id: string, movimientosUpdateDTO: CcClientesMovimientosUpdateDTO): Promise<ICcClientesMovimientos> {
    const movimientos = await this.movimientosModel.findByIdAndUpdate(id, movimientosUpdateDTO, {new: true});
    return movimientos;    
  }  

}
