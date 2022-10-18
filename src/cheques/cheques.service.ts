import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ChequesUpdateDTO } from './dto/cheques-update';
import { ChequesDTO } from './dto/cheques.dto';
import { ICheques } from './interface/cheques.interface';

@Injectable()
export class ChequesService {

constructor(
  @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
  @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>
  ){};

  // Cheques por ID
  async getId(id: string): Promise<ICheques> {
    
    // Se verifica si el cheque existe
    const chequeDB = await this.chequesModel.findById(id);
    if(!chequeDB) throw new NotFoundException('El cheque no existe'); 

    const pipeline = [];

    // Cheque por ID
    const idCheque = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idCheque} }) 

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

    const cheque = await this.chequesModel.aggregate(pipeline);
    
    return cheque[0];    

  }

  // Listar cheques
  async getAll(querys: any): Promise<ICheques[]> {
        
    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
          from: 'bancos',
          localField: 'banco',
          foreignField: '_id',
          as: 'banco'
      }}
    );

    pipeline.push({ $unwind: '$banco' });

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

    const cheques = await this.chequesModel.aggregate(pipeline);
    
    return cheques;

  }    

  // Crear cheque
  async insert(chequesDTO: ChequesDTO): Promise<ICheques> {

    const { 
      nro_cheque, 
      emisor, 
      importe, 
      banco, 
      fecha_cobro,
      creatorUser,
      updatorUser 
    } = chequesDTO;

    console.log(importe);

    const data = {
      nro_cheque,
      importe,
      emisor,
      banco,
      fecha_cobro: add(new Date(fecha_cobro),{ hours: 3 }), // Fecha +3 horas
      creatorUser,
      updatorUser
    }

    // Nuevo cheque
    const nuevoCheque = new this.chequesModel(data);
    const chequeRes = await nuevoCheque.save();

    // Impacto en Caja - Cheques
    const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
    const nuevoSaldo = cajaChequeDB.saldo + importe;
    await this.cajasModel.findByIdAndUpdate(cajaChequeDB._id, { saldo: nuevoSaldo });

    return chequeRes;
    
  }  

  // Actualizar cheque
  async update(id: string, chequesUpdateDTO: ChequesUpdateDTO): Promise<ICheques> {

    const {
      nro_cheque,
      emisor,
      importe,
      fecha_cobro,
      banco,
      updatorUser
    } = chequesUpdateDTO;

    const chequeDB = await this.chequesModel.findById(id);
    
    // Verificacion: El cheque no existe
    if(!chequeDB) throw new NotFoundException('El cheque no existe');
  
    const data = {
      nro_cheque,
      emisor,
      importe,
      fecha_cobro: add(new Date(fecha_cobro), { hours: 3 }), // Adaptando fecha de cobro - Formato de base de datos
      banco,
      updatorUser
    }

    const cheque = await this.chequesModel.findByIdAndUpdate(id, data, {new: true});
    return cheque;
    
  }  

  // Eliminar cheque
  async delete(id: string): Promise<ICheques> {

    const chequeDB = await this.chequesModel.findById(id);
    
    // Verificacion: El cheque no existe
    if(!chequeDB) throw new NotFoundException('El cheque no existe');
  
    // Impacto en Caja - Cheques
    const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
    const nuevoSaldo = cajaChequeDB.saldo - chequeDB.importe;
    await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: nuevoSaldo });

    const cheque = await this.chequesModel.findByIdAndDelete(id);
    return cheque;
    
  }

}
