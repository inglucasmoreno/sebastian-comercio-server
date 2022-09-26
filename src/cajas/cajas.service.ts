import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CajasUpdateDTO } from './dto/cajas-update.dto';
import { CajasDTO } from './dto/cajas.dto';
import { ICajas } from './interface/cajas.interface';

@Injectable()
export class CajasService {

constructor(@InjectModel('Cajas') private readonly cajasModel: Model<ICajas>){};

  // Caja por ID
  async getId(id: string): Promise<ICajas> {
    
    // Se verifica que la caja existe
    const cajaDB = await this.cajasModel.findById(id);
    if(!cajaDB) throw new NotFoundException('La caja no existe'); 

    const pipeline = [];

    // Caja por ID
    const idCaja = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idCaja} }) 

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

    const caja = await this.cajasModel.aggregate(pipeline);
    
    return caja[0];    

  }

  // Listar cajas
  async getAll(querys: any): Promise<ICajas[]> {
        
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

    const cajas = await this.cajasModel.aggregate(pipeline);
    
    return cajas;

  }    

  // Crear caja
  async insert(cajasDTO: CajasDTO): Promise<ICajas> {

    // Verificacion: descripcion repetida
    const caja = await this.cajasModel.findOne({descripcion: cajasDTO.descripcion.trim().toUpperCase()})
    if(caja) throw new NotFoundException('La caja ya se encuentra cargada');

    const nuevaCaja = new this.cajasModel(cajasDTO);
    return await nuevaCaja.save();
  }  

  // Actualizar caja
  async update(id: string, cajasUpdateDTO: CajasUpdateDTO): Promise<ICajas> {

    const { descripcion, activo } = cajasUpdateDTO;

    const cajaDB = await this.cajasModel.findById(id);
    
    // Verificacion: La caja no existe
    if(!cajaDB) throw new NotFoundException('La caja no existe');
    
    // Verificacion: descripcion repetida
    if(descripcion){
      const cajaDescripcion = await this.cajasModel.findOne({descripcion: descripcion.trim().toUpperCase()})
      if(cajaDescripcion && cajaDescripcion._id.toString() !== id) throw new NotFoundException('La caja ya se encuentra cargada');
    }

    const caja = await this.cajasModel.findByIdAndUpdate(id, cajasUpdateDTO, {new: true});
    return caja;
    
  }  

}
