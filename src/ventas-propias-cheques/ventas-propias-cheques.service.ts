import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IProductos } from 'src/productos/interface/productos.interface';
import { VentasPropiasChequesDTO } from './dto/ventas-propias-cheques.dto';
import { IVentasPropiasCheques } from './interface/ventas-propias-cheques.interface';

@Injectable()
export class VentasPropiasChequesService {

constructor(@InjectModel('VentasPropiasCheques') private readonly relacionesModel: Model<IVentasPropiasCheques>,
            @InjectModel('Productos') private readonly productosModel: Model<IProductos>){};

  // Ventas propias - Cheques por ID
  async getId(id: string): Promise<IVentasPropiasCheques> {
    
    // Se verifica si la relacion existe
    const relacionDB = await this.relacionesModel.findById(id);
    if(!relacionDB) throw new NotFoundException('La relacion no existe'); 

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idRelacion} }) 

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

    // Informacion de cheque
    pipeline.push({
      $lookup: { // Lookup
          from: 'cheques',
          localField: 'cheque',
          foreignField: '_id',
          as: 'cheque'
      }}
    );

    pipeline.push({ $unwind: '$cheque' });

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

    const relacion = await this.relacionesModel.aggregate(pipeline);
    
    return relacion[0];    

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IVentasPropiasCheques[]> {
        
    const {columna, direccion, venta_propia} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    if(venta_propia && venta_propia.trim() !== ''){
      const idVenta = new Types.ObjectId(venta_propia);
      pipeline.push({ $match:{ venta_propia: idVenta} }) 
    }

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

    // Informacion de cheque
    pipeline.push({
      $lookup: { // Lookup
          from: 'cheques',
          localField: 'cheque',
          foreignField: '_id',
          as: 'cheque'
      }}
    );

    pipeline.push({ $unwind: '$cheque' });

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
          from: 'bancos',
          localField: 'cheque.banco',
          foreignField: '_id',
          as: 'cheque.banco'
      }}
    );

    pipeline.push({ $unwind: '$cheque.banco' });

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

    const relaciones = await this.relacionesModel.aggregate(pipeline);
    
    return relaciones;

  }    

  // Crear relacion
  async insert(relacionesDTO: VentasPropiasChequesDTO): Promise<IVentasPropiasCheques> {
    const nuevaRelacion = new this.relacionesModel(relacionesDTO);
    return await nuevaRelacion.save();
  }  

  // Actualizar relacion
  async update(id: string, relacionesUpdateDTO: VentasPropiasChequesDTO): Promise<IVentasPropiasCheques> {

    const relacionDB = await this.relacionesModel.findById(id);
    
    // Verificacion: La relacion no existe
    if(!relacionDB) throw new NotFoundException('La relacion no existe');
  
    const relacion = await this.relacionesModel.findByIdAndUpdate(id, relacionesUpdateDTO, {new: true});
    return relacion;
    
  }  

}
