import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CcClientesUpdateDTO } from './dto/cc-clientes-update.dto';
import { CcClientesDTO } from './dto/cc-clientes.dto';
import { ICcClientes } from './interface/cc-clientes.interface';

@Injectable()
export class CcClientesService {

  constructor(@InjectModel('CcClientes') private readonly cuentaCorrienteModel: Model<ICcClientes>){};

  // CC por ID
  async getId(id: string): Promise<ICcClientes> {
    
    // Se verifica que la CC existe
    const cuentaCorrienteDB = await this.cuentaCorrienteModel.findById(id);
    if(!cuentaCorrienteDB) throw new NotFoundException('La cuenta corriente no existe'); 

    const pipeline = [];

    // Cuenta corriente por ID
    const idCuentaCorriente = new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idCuentaCorriente} }) 

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
          from: 'clientes',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente'
      }}
    );

    pipeline.push({ $unwind: '$cliente' });


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

    const cuentaCorriente = await this.cuentaCorrienteModel.aggregate(pipeline);
    
    return cuentaCorriente[0];    

  }

  // CC por cliente
  async getPorCliente(idCliente: string): Promise<ICcClientes> {
    
    const pipeline = [];

    // Cuenta corriente por cliente
    const cliente = new Types.ObjectId(idCliente);
    pipeline.push({ $match:{ cliente } }); 

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
          from: 'clientes',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente'
      }}
    );

    pipeline.push({ $unwind: '$cliente' });


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

    const cuentaCorriente = await this.cuentaCorrienteModel.aggregate(pipeline);
    
    return cuentaCorriente[0];    

  }

  // Listar cuentas corrientes
  async getAll(querys: any): Promise<ICcClientes[]> {
        
    const {columna, direccion} = querys;

    const pipeline = [];
    pipeline.push({$match:{}});

    // Informacion de cliente
    pipeline.push({
      $lookup: { // Lookup
          from: 'clientes',
          localField: 'cliente',
          foreignField: '_id',
          as: 'cliente'
      }}
    );

    pipeline.push({ $unwind: '$cliente' });

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

    const cuentas_corrientes = await this.cuentaCorrienteModel.aggregate(pipeline);
    
    return cuentas_corrientes;

  }    

  // Crear cuenta corriente
  async insert(cuentaCorrienteDTO: CcClientesDTO): Promise<ICcClientes> {

    // Verificacion: Si hay una cuenta corriente creada para el cliente
    const cuenta_corriente = await this.cuentaCorrienteModel.findOne({cliente: cuentaCorrienteDTO.cliente})
    if(cuenta_corriente) throw new NotFoundException('Este cliente ya tiene una cuenta corriente');

    const nuevaCuenta = new this.cuentaCorrienteModel(cuentaCorrienteDTO);
    return await nuevaCuenta.save();
  }  

  // Actualizar cuenta corriente
  async update(id: string, cuentaCorrienteUpdateDTO: CcClientesUpdateDTO): Promise<ICcClientes> {
    const cuentaCorriente = await this.cuentaCorrienteModel.findByIdAndUpdate(id, cuentaCorrienteUpdateDTO, {new: true});
    return cuentaCorriente;    
  }  

}
