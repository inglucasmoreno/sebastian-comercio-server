import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FamiliaProductosUpdateDTO } from './dto/familia-productos-update.dto';
import { FamiliaProductosDTO } from './dto/familia-productos.dto';
import { IFamiliaProductos } from './interface/familia-productos.interface';

@Injectable()
export class FamiliaProductosService {

  constructor(@InjectModel('FamiliaProductos') private readonly familiaProductosModel: Model<IFamiliaProductos>){};

  // Familia por ID
  async getId(id: string): Promise<IFamiliaProductos> {
    
    // Se verifica que la familia existe
    const familiaDB = await this.familiaProductosModel.findById(id);
    if(!familiaDB) throw new NotFoundException('La familia no existe'); 

    const pipeline = [];

    // Familia por ID
    const idFamilia = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idFamilia} }) 

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

    const familia = await this.familiaProductosModel.aggregate(pipeline);
    
    return familia[0];    

  }

  // Listar familias
  async getAll(querys: any): Promise<IFamiliaProductos[]> {
        
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

    const familias = await this.familiaProductosModel.aggregate(pipeline);
    
    return familias;

  }    

  // Crear familia
  async insert(familiaDTO: FamiliaProductosDTO): Promise<IFamiliaProductos> {

    // Verificacion: descripcion repetida
    const familia = await this.familiaProductosModel.findOne({descripcion: familiaDTO.descripcion.trim().toUpperCase()})
    if(familia) throw new NotFoundException('La familia ya se encuentra cargada');

    const nuevaFamilia = new this.familiaProductosModel(familiaDTO);
    return await nuevaFamilia.save();
  }  

  // Actualizar familia
  async update(id: string, familiaUpdateDTO: FamiliaProductosUpdateDTO): Promise<IFamiliaProductos> {

    const { descripcion, activo } = familiaUpdateDTO;

    const familiaDB = await this.familiaProductosModel.findById(id);
    
    // Verificacion: La familia no existe
    if(!familiaDB) throw new NotFoundException('La familia no existe');
    
    // Verificacion: descripcion repetida
    if(descripcion){
      const familiaDescripcion = await this.familiaProductosModel.findOne({descripcion: descripcion.trim().toUpperCase()})
      if(familiaDescripcion && familiaDescripcion._id.toString() !== id) throw new NotFoundException('La familia ya se encuentra cargada');
    }

    // Baja de familia - Siempre y cuando no este asociada a un producto
    if(activo !== undefined && !activo){
      const producto = await this.familiaProductosModel.findOne({ familia: familiaDB._id });
      if(producto) throw new NotFoundException('Esta familia esta asociada a un producto');   
    }

    const familia = await this.familiaProductosModel.findByIdAndUpdate(id, familiaUpdateDTO, {new: true});
    return familia;
    
  }  

}
