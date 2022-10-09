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
  async getAll(querys: any): Promise<ICcClientesMovimientos[]> {
        
    const {columna, direccion, cc_cliente} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Filtro por cuenta corriente
    if(cc_cliente && cc_cliente.trim() !== ''){
      const idCuentaCorriente = new Types.ObjectId(cc_cliente);
      pipeline.push({ $match:{ cc_cliente: idCuentaCorriente } }); 
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
    if(columna){
        ordenar[String(columna)] = Number(direccion);
        pipeline.push({$sort: ordenar});
    }      

    const movimientos = await this.movimientosModel.aggregate(pipeline);
    
    return movimientos;

  }    

  // Crear movimientos
  async insert(movimientosDTO: CcClientesMovimientosDTO): Promise<any> {

    const { cc_cliente, monto ,tipo } = movimientosDTO;

    // Calculo de saldos - Cuenta corriente
    const cuentaCorriente = await this.cuentaCorrienteModel.findById(cc_cliente);

    const saldo_anterior = cuentaCorriente.saldo;
    const saldo_nuevo = tipo === 'Haber' ? saldo_anterior - monto : saldo_anterior + monto;

    const data = {...movimientosDTO, saldo_anterior, saldo_nuevo};

    // Actualizacion de saldo - Cuenta corriente
    await this.cuentaCorrienteModel.findByIdAndUpdate(cc_cliente, { saldo: saldo_nuevo });

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
