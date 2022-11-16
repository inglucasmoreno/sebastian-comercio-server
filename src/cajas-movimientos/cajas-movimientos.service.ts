import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { CajasMovimientosUpdateDTO } from './dto/cajas-movimientos-update.dto';
import { CajasMovimientosDTO } from './dto/cajas-movimientos.dto';
import { ICajasMovimientos } from './interface/cajas-movimientos.interface';

@Injectable()
export class CajasMovimientosService {

  constructor(
    @InjectModel('CajasMovimientos') private readonly movimientosModel: Model<ICajasMovimientos>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
  ){};


  // Funcion para redondeo
  redondear(numero:number, decimales:number):number {
  
    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));
  
  }

  // Movimientos por ID
  async getId(id: string): Promise<ICajasMovimientos> {
    
    // Se verifica que el movimiento existe
    const movimientoDB = await this.movimientosModel.findById(id);
    if(!movimientoDB) throw new NotFoundException('El movimiento no existe'); 

    const pipeline = [];

    // Informacion de caja
    pipeline.push({
      $lookup: { // Lookup
          from: 'cajas',
          localField: '',
          foreignField: '_id',
          as: 'caja'
      }}
    );

    pipeline.push({ $unwind: '$caja' });

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
      parametro,
      caja
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({$match:{}});
    pipelineTotal.push({$match:{}});

    // Filtro por caja
    if(caja && caja.trim() !== ''){
      const idCaja = new Types.ObjectId(caja);
      pipeline.push({ $match:{ caja: idCaja } }); 
      pipelineTotal.push({ $match:{ caja: idCaja } }); 
    }

		// Filtro por parametros
		if(parametro && parametro !== ''){
			
      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for(var i = 0; i < porPartes.length; i++){
        if(i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal,'i');
      pipeline.push({$match: { $or: [ { nro: Number(parametro) }, { descripcion: regex } ] }});
			pipelineTotal.push({$match: { $or: [ { nro: Number(parametro) }, { descripcion: regex } ] }});
      
		}

    // Informacion de caja
    pipeline.push({
      $lookup: { // Lookup
          from: 'cajas',
          localField: 'caja',
          foreignField: '_id',
          as: 'caja'
      }}
    );

    pipeline.push({ $unwind: '$caja' });

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

    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    const [movimientos, movimientosTotal] = await Promise.all([
      this.movimientosModel.aggregate(pipeline),
      this.movimientosModel.aggregate(pipelineTotal)
    ]);

    return {
      movimientos,
      totalItems: movimientosTotal.length,
    };

  }    

  // Crear movimientos
  async insert(movimientosDTO: CajasMovimientosDTO): Promise<any> {

    const { caja, monto ,tipo } = movimientosDTO;

    // Calculo de saldos - Caja
    const cajaDB = await this.cajasModel.findById(caja);

    const saldo_anterior = cajaDB.saldo;
    const saldo_nuevo = tipo === 'Haber' ? saldo_anterior - monto : saldo_anterior + monto;

    const data = {
      ...movimientosDTO, 
      saldo_anterior: this.redondear(saldo_anterior, 2), 
      saldo_nuevo: this.redondear(saldo_nuevo, 2)
    };

    // Actualizacion de saldo - Caja
    await this.cajasModel.findByIdAndUpdate(caja, { 
      saldo: this.redondear(saldo_nuevo, 2) 
    });

    // Generacion de nuevo movimiento
    const nuevoMovimiento = new this.movimientosModel(data);
    await nuevoMovimiento.save();
    
    return { saldo_nuevo };

  }  

  // Actualizar movimientos
  async update(id: string, movimientosUpdateDTO: CajasMovimientosUpdateDTO): Promise<ICajasMovimientos> {
    const movimientos = await this.movimientosModel.findByIdAndUpdate(id, movimientosUpdateDTO, {new: true});
    return movimientos;    
  }  

}
