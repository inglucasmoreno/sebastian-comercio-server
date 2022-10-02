import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, Schema } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { identity } from 'rxjs';
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
  async getAll(querys: any): Promise<any> {
        
    const {
      columna,
      direccion,
      desde,
      registerpp, 
      activo,
      tipo_movimiento,
      parametro
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({$match:{}});
    pipelineTotal.push({$match:{}});

    // Ordenando datos
    const ordenar: any = {};
    if(columna){
        ordenar[String(columna)] = Number(direccion);
        pipeline.push({$sort: ordenar});
    }    

    // Filtro - Activo / Inactivo
    let filtroActivo = {};
    if(activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({$match: filtroActivo});
      pipelineTotal.push({$match: filtroActivo});
    }

    // Filtro - Tipo de movimiento
    if(tipo_movimiento && tipo_movimiento !== '') {
      const idTipo = new Types.ObjectId(tipo_movimiento);
      pipeline.push({$match: { tipo_movimiento: idTipo }});
      pipelineTotal.push({$match: { tipo_movimiento: idTipo }});
    }

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
          from: 'tipos_movimientos',
          localField: 'tipo_movimiento',
          foreignField: '_id',
          as: 'tipo_movimiento'
      }}
    );

    pipeline.push({ $unwind: '$tipo_movimiento' });

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

    // Filtro - Parametros
    if(parametro && parametro !== ''){
      const regex = new RegExp(parametro, 'i');
      pipeline.push({$match: { $or: [ { origen_descripcion: regex }, { destino_descripcion: regex } ] }});
      pipelineTotal.push({$match: { $or: [ { origen_descripcion: regex }, { destino_descripcion: regex } ] }});
    }

    const [movimientos, totalItems] = await Promise.all([
      this.movimientosModel.aggregate(pipeline),
      this.movimientosModel.aggregate(pipelineTotal),
    ])
    
    return {
      movimientos,
      totalItems: totalItems.length
    };

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
