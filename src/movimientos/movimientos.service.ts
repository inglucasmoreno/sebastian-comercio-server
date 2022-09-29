import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MovimientosUpdateDTO } from './dto/movimientos-update.dto';
import { MovimientosDTO } from './dto/movimientos.dto';
import { IMovimientos } from './interface/movimientos.interface';

@Injectable()
export class MovimientosService {

constructor(@InjectModel('Movimientos') private readonly movimientosModel: Model<IMovimientos>){};

  // Movimiento por ID
  async getId(id: string): Promise<IMovimientos> {
    
    // Se verifica que el movimiento existe
    const movimientoDB = await this.movimientosModel.findById(id);
    if(!movimientoDB) throw new NotFoundException('El movimiento no existe'); 

    const pipeline = [];

    // Movimiento por ID
    const idMovimiento = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idMovimiento} }) 

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
  async getAll(querys: any): Promise<IMovimientos[]> {
        
    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

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

  // Crear movimiento
  async insert(movimientosDTO: MovimientosDTO): Promise<IMovimientos> {
    const nuevoMovimiento = new this.movimientosModel(movimientosDTO);
    return await nuevoMovimiento.save();
  }  

  // Actualizar movimiento
  async update(id: string, movimientosUpdateDTO: MovimientosUpdateDTO): Promise<IMovimientos> {

    const { activo } = movimientosUpdateDTO;

    const movimientoDB = await this.movimientosModel.findById(id);
    
    // Verificacion: El movimiento no existe
    if(!movimientoDB) throw new NotFoundException('El movimiento no existe');
    
    const movimiento = await this.movimientosModel.findByIdAndUpdate(id, movimientosUpdateDTO, {new: true});
    return movimiento;
    
  }  


}
