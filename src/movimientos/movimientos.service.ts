import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { IClientes } from 'src/clientes/interface/clientes.interface';
import { IProveedores } from 'src/proveedores/interface/proveedores.interface';
import { ITiposMovimientos } from 'src/tipos-movimientos/interface/tipos-movimientos.interface';
import { MovimientosUpdateDTO } from './dto/movimientos-update.dto';
import { MovimientosDTO } from './dto/movimientos.dto';
import { IMovimientos } from './interface/movimientos.interface';

@Injectable()
export class MovimientosService {

constructor(
  @InjectModel('Movimientos') private readonly movimientosModel: Model<IMovimientos>,
  @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
  @InjectModel('Proveedores') private readonly proveedoresModel: Model<IProveedores>,
  @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
  @InjectModel('TiposMovimientos') private readonly tiposMovimientosModel: Model<ITiposMovimientos>
){};

  // Valores iniciales de seccion
  async init(): Promise<any> {

    // Listado de movimientos
    const [tiposMovimientos, cajas, proveedores, clientes] = await Promise.all([
      await this.tiposMovimientosModel.find({ activo: true }).sort({ descripcion: 1 }),
      await this.cajasModel.find({ activo: true }).sort({ descripcion: 1 }),
      await this.proveedoresModel.find({ activo: true }).sort({ descripcion: 1 }),      
      await this.clientesModel.find({ activo: true }).sort({ descripcion: 1 }),      
    ])

    return {
      tiposMovimientos,
      cajas,
      proveedores,
      clientes
    }

  }


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

    const { tipo_origen, origen, origen_monto_nuevo, tipo_destino, destino, destino_monto_nuevo } = movimientosDTO;

    // Ajuste de saldos
    
    if(tipo_origen === 'Interno') await this.cajasModel.findByIdAndUpdate(origen, { saldo: origen_monto_nuevo });
    if(tipo_destino === 'Interno') await this.cajasModel.findByIdAndUpdate(destino, { saldo: destino_monto_nuevo });

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
