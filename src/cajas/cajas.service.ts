import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { IMovimientosInternos } from 'src/movimientos-internos/interface/movimientos-internos.interface';
import { CajasUpdateDTO } from './dto/cajas-update.dto';
import { CajasDTO } from './dto/cajas.dto';
import { ICajas } from './interface/cajas.interface';

@Injectable()
export class CajasService {

constructor(
  @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
  @InjectModel('CajasMovimientos') private readonly movimientosModel: Model<ICajasMovimientos>,
  @InjectModel('MovimientosInternos') private readonly movimientosInternosModel: Model<IMovimientosInternos>,
  ){};

  // Funcion para redondeo
  redondear(numero:number, decimales:number):number {
  
    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));
  
  }

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

    const { descripcion } = cajasUpdateDTO;

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

  // Movimiento interno de cajas
  async movimientoInterno(movimientoData: any): Promise<any> {

    const { 
      caja_origen, 
      caja_destino,
      monto_origen,
      monto_destino, 
      observacion,
      creatorUser,
      updatorUser
    } = movimientoData;

    const ultimoMovimientoInternoDB = await this.movimientosInternosModel.find().sort({ createdAt: -1 }).limit(1);

    // Proximo numero de MOVIMIENTO INTERNO
    let nroMovimientoInterno = 0;
    ultimoMovimientoInternoDB.length === 0 ? nroMovimientoInterno = 1 : nroMovimientoInterno = Number(ultimoMovimientoInternoDB[0].nro + 1);

    const dataMovimientoInterno = {
      nro: nroMovimientoInterno,
      caja_origen,
      caja_destino,
      monto_origen,
      monto_destino,
      observacion,
      creatorUser,
      updatorUser
    }

    const nuevoMovimientoInterno = new this.movimientosInternosModel(dataMovimientoInterno);

    const [ultimoCajaMov, caja_origenDB, caja_destinoDB, movimiento_internoDB] = await Promise.all([
      this.movimientosModel.find().sort({ createdAt: -1 }).limit(1),
      this.cajasModel.findById(caja_origen),
      this.cajasModel.findById(caja_destino),
      nuevoMovimientoInterno.save()
    ])
    
    // Proximo numero de MOVIMIENTO DE CAJA
    let nroMovimiento = 0;
    ultimoCajaMov.length === 0 ? nroMovimiento = 1 : nroMovimiento= Number(ultimoCajaMov[0].nro + 1);

    const nuevoSaldoOrigen = caja_origenDB.saldo - monto_origen;
    const nuevoSaldoDestino = caja_destinoDB.saldo + monto_destino;
  
    // 1) - CAJA ORIGEN
    
    const nuevoMovimientoOrigen = new this.movimientosModel({
      nro: nroMovimiento,
      caja: caja_origen,
      monto: this.redondear(monto_origen, 2),
      saldo_anterior: this.redondear(caja_origenDB.saldo, 2),
      saldo_nuevo: this.redondear(nuevoSaldoOrigen, 2),
      tipo: 'Haber',
      venta_propia: '',
      movimiento_interno: movimiento_internoDB._id,
      descripcion: 'MOVIMIENTO INTERNO',
      observacion: caja_origenDB.descripcion + ' -> ' + caja_destinoDB.descripcion,
      creatorUser,
      updatorUser
    });

    // 2) - CAJA DESTINO   

    const nuevoMovimientoDestino = new this.movimientosModel({
      nro: nroMovimiento + 1,
      caja: caja_destino,
      monto: this.redondear(monto_destino, 2),
      saldo_anterior: this.redondear(caja_destinoDB.saldo, 2),
      saldo_nuevo: this.redondear(nuevoSaldoDestino, 2),
      tipo: 'Debe',
      venta_propia: '',
      movimiento_interno: movimiento_internoDB._id,
      descripcion: 'MOVIMIENTO INTERNO',
      observacion: caja_origenDB.descripcion + ' -> ' + caja_destinoDB.descripcion,
      creatorUser,
      updatorUser
    });

    // Impacto simultaneo - En saldos y movimientos
    const [_,__,___,____] = await Promise.all([
      
      this.cajasModel.findByIdAndUpdate(caja_origen, { 
        saldo: this.redondear(nuevoSaldoOrigen, 2) }),

      this.cajasModel.findByIdAndUpdate(caja_destino, { 
        saldo: this.redondear(nuevoSaldoDestino, 2) }),
      
      nuevoMovimientoOrigen.save(),
      nuevoMovimientoDestino.save()
    
    ])

    return 'Movimiento interno generado exitosamente';
  
  } 

}
