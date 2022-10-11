import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICcProveedores } from 'src/cc-proveedores/interface/cc-proveedores.interface';
import { CcProveedoresMovimientosUpdateDTO } from './dto/cc-proveedores-update.dto';
import { CcProveedoresMovimientosDTO } from './dto/cc-proveedores.dto';
import { ICcProveedoresMovimientos } from './interface/cc-proveedores-movimientos.interface';

@Injectable()
export class CcProveedoresMovimientosService {

  constructor(
    @InjectModel('CcProveedoresMovimientos') private readonly movimientosModel: Model<ICcProveedoresMovimientos>,
    @InjectModel('CcProveedores') private readonly cuentaCorrienteModel: Model<ICcProveedores>
  ){};

  // Movimientos por ID
  async getId(id: string): Promise<ICcProveedoresMovimientos> {
    
    // Se verifica que el movimiento existe
    const movimientoDB = await this.movimientosModel.findById(id);
    if(!movimientoDB) throw new NotFoundException('El movimiento no existe'); 

    const pipeline = [];

    // Informacion de proveedor
    pipeline.push({
      $lookup: { // Lookup
          from: 'cc_proveedores',
          localField: 'cc_proveedor',
          foreignField: '_id',
          as: 'cc_proveedor'
      }}
    );

    pipeline.push({ $unwind: '$cc_proveedor' });

    // Movimiento por ID
    const idMovimiento = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idMovimiento} }) 

    // Informacion de proveedor
    pipeline.push({
      $lookup: { // Lookup
          from: 'proveedores',
          localField: 'proveedor',
          foreignField: '_id',
          as: 'proveedor'
      }}
    );

    pipeline.push({ $unwind: '$proveedor' });


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
  async getAll(querys: any): Promise<ICcProveedoresMovimientos[]> {
        
    const {columna, direccion, cc_proveedor} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Filtro por cuenta corriente
    if(cc_proveedor && cc_proveedor.trim() !== ''){
      const idCuentaCorriente = new Types.ObjectId(cc_proveedor);
      pipeline.push({ $match:{ cc_proveedor: idCuentaCorriente } }); 
    }

    // Informacion de cuenta corriente
    pipeline.push({
      $lookup: { // Lookup
          from: 'cc_proveedores',
          localField: 'cc_proveedor',
          foreignField: '_id',
          as: 'cc_proveedor'
      }}
    );

    pipeline.push({ $unwind: '$cc_proveedor' });

    // Informacion de proveedor
    pipeline.push({
      $lookup: { // Lookup
          from: 'proveedores',
          localField: 'proveedor',
          foreignField: '_id',
          as: 'proveedor'
      }}
    );

    pipeline.push({ $unwind: '$proveedor' });

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
  async insert(movimientosDTO: CcProveedoresMovimientosDTO): Promise<any> {
    
    const { cc_proveedor, monto ,tipo } = movimientosDTO;

    // Calculo de saldos - Cuenta corriente
    const cuentaCorriente = await this.cuentaCorrienteModel.findById(cc_proveedor);

    const saldo_anterior = cuentaCorriente.saldo;
    const saldo_nuevo = tipo === 'Haber' ? saldo_anterior - monto : saldo_anterior + monto;

    const data = {...movimientosDTO, saldo_anterior, saldo_nuevo};

    // Actualizacion de saldo - Cuenta corriente
    await this.cuentaCorrienteModel.findByIdAndUpdate(cc_proveedor, { saldo: saldo_nuevo });

    // Generacion de nuevo movimiento
    const nuevoMovimiento = new this.movimientosModel(data);
    await nuevoMovimiento.save();
    
    return { saldo_nuevo };  
  
  }  

  // Actualizar movimientos
  async update(id: string, movimientosUpdateDTO: CcProveedoresMovimientosUpdateDTO): Promise<ICcProveedoresMovimientos> {
    const movimientos = await this.movimientosModel.findByIdAndUpdate(id, movimientosUpdateDTO, {new: true});
    return movimientos;    
  }  

}