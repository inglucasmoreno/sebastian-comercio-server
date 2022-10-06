import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CcProveedoresMovimientosUpdateDTO } from './dto/cc-proveedores-update.dto';
import { CcProveedoresMovimientosDTO } from './dto/cc-proveedores.dto';
import { ICcProveedoresMovimientos } from './interface/cc-proveedores-movimientos.interface';

@Injectable()
export class CcProveedoresMovimientosService {

  constructor(@InjectModel('CcProveedoresMovimientos') private readonly movimientosModel: Model<ICcProveedoresMovimientos>){};

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
          localField: '',
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
        
    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Informacion de cuenta corriente
    pipeline.push({
      $lookup: { // Lookup
          from: 'cc_proveedores',
          localField: '',
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
  async insert(movimientosDTO: CcProveedoresMovimientosDTO): Promise<ICcProveedoresMovimientos> {
    const nuevoMovimiento = new this.movimientosModel(movimientosDTO);
    return await nuevoMovimiento.save();
  }  

  // Actualizar movimientos
  async update(id: string, movimientosUpdateDTO: CcProveedoresMovimientosUpdateDTO): Promise<ICcProveedoresMovimientos> {
    const movimientos = await this.movimientosModel.findByIdAndUpdate(id, movimientosUpdateDTO, {new: true});
    return movimientos;    
  }  

}
