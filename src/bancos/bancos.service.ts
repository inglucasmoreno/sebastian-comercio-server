import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BancosUpdateDTO } from './dto/bancos-update.dto';
import { BancosDTO } from './dto/bancos.dto';
import { IBancos } from './interface/bancos.interface';

@Injectable()
export class BancosService {

constructor(@InjectModel('Bancos') private readonly bancosModel: Model<IBancos>){};

  // Bancos por ID
  async getId(id: string): Promise<IBancos> {
    
    // Se verifica si el banco existe
    const bancoDB = await this.bancosModel.findById(id);
    if(!bancoDB) throw new NotFoundException('El banco no existe'); 

    const pipeline = [];

    // Banco por ID
    const idBanco = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idBanco} }) 

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

    const banco = await this.bancosModel.aggregate(pipeline);
    
    return banco[0];    

  }

  // Listar bancos
  async getAll(querys: any): Promise<IBancos[]> {
        
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

    const bancos = await this.bancosModel.aggregate(pipeline);
    
    return bancos;

  }    

  // Crear banco
  async insert(bancosDTO: BancosDTO): Promise<IBancos> {

    // Verificacion: descripcion repetida
    const banco = await this.bancosModel.findOne({descripcion: bancosDTO.descripcion.trim().toUpperCase()})
    if(banco) throw new NotFoundException('El banco ya se encuentra cargado');

    const nuevoBanco = new this.bancosModel(bancosDTO);
    return await nuevoBanco.save();
  }  

  // Actualizar banco
  async update(id: string, bancosUpdateDTO: BancosUpdateDTO): Promise<IBancos> {

    const { descripcion, activo } = bancosUpdateDTO;

    const bancoDB = await this.bancosModel.findById(id);
    
    // Verificacion: El banco no existe
    if(!bancoDB) throw new NotFoundException('El banco no existe');
    
    // Verificacion: descripcion repetida
    if(descripcion){
      const bancoDescripcion = await this.bancosModel.findOne({descripcion: descripcion.trim().toUpperCase()})
      if(bancoDescripcion && bancoDescripcion._id.toString() !== id) throw new NotFoundException('El banco ya se encuentra cargada');
    }

    const banco = await this.bancosModel.findByIdAndUpdate(id, bancosUpdateDTO, {new: true});
    return banco;
    
  }  



}
