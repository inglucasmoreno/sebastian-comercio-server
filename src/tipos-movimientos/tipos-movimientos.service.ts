import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TiposMovimientosUpdateDTO } from './dto/tipos-movimientos-update.dto';
import { TiposMovimientosDTO } from './dto/tipos-movimientos.dto';
import { ITiposMovimientos } from './interface/tipos-movimientos.interface';

@Injectable()
export class TiposMovimientosService {

constructor(@InjectModel('TiposMovimientos') private readonly tiposMovimientosModel: Model<ITiposMovimientos>){};

  // Tipo movimiento por ID
  async getId(id: string): Promise<ITiposMovimientos> {
    
    // Se verifica que el tipo existe
    const tipoDB = await this.tiposMovimientosModel.findById(id);
    if(!tipoDB) throw new NotFoundException('El tipo no existe no existe'); 

    const pipeline = [];

    // Tipo por ID
    const idTipo = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idTipo} }) 

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

    const tipo = await this.tiposMovimientosModel.aggregate(pipeline);
    
    return tipo[0];    

  }

  // Listar tipos de movimientos
  async getAll(querys: any): Promise<ITiposMovimientos[]> {
        
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

    const tipos = await this.tiposMovimientosModel.aggregate(pipeline);
    
    return tipos;

  }    

  // Crear tipo
  async insert(tipoDTO: TiposMovimientosDTO): Promise<ITiposMovimientos> {

    // Verificacion: descripcion repetida
    const tipo = await this.tiposMovimientosModel.findOne({descripcion: tipoDTO.descripcion.trim().toUpperCase()})
    if(tipo) throw new NotFoundException('El tipo ya se encuentra cargado');

    const nuevoTipo = new this.tiposMovimientosModel(tipoDTO);
    return await nuevoTipo.save();
  }  

  // Actualizar tipo
  async update(id: string, tiposUpdateDTO: TiposMovimientosUpdateDTO): Promise<ITiposMovimientos> {

    const { descripcion, activo } = tiposUpdateDTO;

    const tipoDB = await this.tiposMovimientosModel.findById(id);
    
    // Verificacion: El tipo no existe
    if(!tipoDB) throw new NotFoundException('El tipo no existe');
    
    // Verificacion: descripcion repetida
    if(descripcion){
      const tipoDescripcion = await this.tiposMovimientosModel.findOne({descripcion: descripcion.trim().toUpperCase()})
      if(tipoDescripcion && tipoDescripcion._id.toString() !== id) throw new NotFoundException('El tipo ya se encuentra cargado');
    }

    const tipo = await this.tiposMovimientosModel.findByIdAndUpdate(id, tiposUpdateDTO, {new: true});
    return tipo;
    
  }  



}
