import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecibosCobrosUpdateDTO } from './dto/recibo-cobro-update';
import { RecibosCobrosDTO } from './dto/recibo-cobro.dto';
import { IRecibosCobros } from './interface/recibo-cobro-interface';

@Injectable()
export class ReciboCobroService {

constructor(@InjectModel('RecibosCobros') private readonly recibosCobrosModel: Model<IRecibosCobros>){};

  // Recibo de cobro por ID
  async getId(id: string): Promise<IRecibosCobros> {
    
    // Se verifica que el recibo existe
    const reciboDB = await this.recibosCobrosModel.findById(id);
    if(!reciboDB) throw new NotFoundException('El recibo no existe'); 

    const pipeline = [];

    // Recibo por ID
    const idRecibo = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idRecibo} }) 

    // Informacion de venta propia
    pipeline.push({
      $lookup: { // Lookup
          from: 'ventas_propias',
          localField: 'venta_propia',
          foreignField: '_id',
          as: 'venta_propia'
      }}
    );

    pipeline.push({ $unwind: '$venta_propia' });

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

    const recibo = await this.recibosCobrosModel.aggregate(pipeline);
    
    return recibo[0];    

  }

  // Listar recibos de cobro
  async getAll(querys: any): Promise<IRecibosCobros[]> {
        
    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'ventas_propias',
          localField: 'venta_propia',
          foreignField: '_id',
          as: 'venta_propia'
      }}
    );

    pipeline.push({ $unwind: '$venta_propia' });

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

    const recibos = await this.recibosCobrosModel.aggregate(pipeline);
    
    return recibos;

  }    

  // Crear recibo de cobro
  async insert(recibosCobrosDTO: RecibosCobrosDTO): Promise<IRecibosCobros> {
    const nuevoRecibo = new this.recibosCobrosModel(recibosCobrosDTO);
    return await nuevoRecibo.save();
  }  

  // Actualizar recibo
  async update(id: string, recibosCobrosUpdateDTO: RecibosCobrosUpdateDTO): Promise<IRecibosCobros> {

    const reciboDB = await this.recibosCobrosModel.findById(id);
    
    // Verificacion: El recibo no existe
    if(!reciboDB) throw new NotFoundException('El recibo no existe');

    const recibo = await this.recibosCobrosModel.findByIdAndUpdate(id, recibosCobrosUpdateDTO, {new: true});
    return recibo;
    
  }  


}
