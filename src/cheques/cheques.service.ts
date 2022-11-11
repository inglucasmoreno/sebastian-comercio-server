import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model, Types } from 'mongoose';
import { ICajasMovimientos } from 'src/cajas-movimientos/interface/cajas-movimientos.interface';
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ChequesUpdateDTO } from './dto/cheques-update';
import { ChequesDTO } from './dto/cheques.dto';
import { ICheques } from './interface/cheques.interface';

@Injectable()
export class ChequesService {

  constructor(
    @InjectModel('Cheques') private readonly chequesModel: Model<ICheques>,
    @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
    @InjectModel('CajasMovimientos') private readonly cajasMovimientosModel: Model<ICajasMovimientos>,
  ) { };

  // Funcion para redondeo
  redondear(numero: number, decimales: number): number {

    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));

  }

  // Cheques por ID
  async getId(id: string): Promise<ICheques> {

    // Se verifica si el cheque existe
    const chequeDB = await this.chequesModel.findById(id);
    if (!chequeDB) throw new NotFoundException('El cheque no existe');

    const pipeline = [];

    // Cheque por ID
    const idCheque = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idCheque } })

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'banco',
        foreignField: '_id',
        as: 'banco'
      }
    }
    );

    pipeline.push({ $unwind: '$banco' });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

    const cheque = await this.chequesModel.aggregate(pipeline);

    return cheque[0];

  }

  // Listar cheques
  async getAll(querys: any): Promise<any> {

    const { 
      columna, 
      direccion, 
      desde,
      registerpp,
      estado,
      parametro,
    } = querys;

    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({ $match: {} });
    pipelineTotal.push({ $match: {} });

    // Por estado
    if(estado && estado !== ''){
      pipeline.push({$match: { estado }});
      pipelineTotal.push({$match: { estado }});
    }

    // Informacion de banco
    pipeline.push({
      $lookup: { // Lookup
        from: 'bancos',
        localField: 'banco',
        foreignField: '_id',
        as: 'banco'
      }
    }
    );

    pipeline.push({ $unwind: '$banco' });

    // Informacion de usuario creador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'creatorUser',
        foreignField: '_id',
        as: 'creatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$creatorUser' });

    // Informacion de usuario actualizador
    pipeline.push({
      $lookup: { // Lookup
        from: 'usuarios',
        localField: 'updatorUser',
        foreignField: '_id',
        as: 'updatorUser'
      }
    }
    );

    pipeline.push({ $unwind: '$updatorUser' });

		// Filtro por parametros
		if(parametro && parametro !== ''){
			
      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for(var i = 0; i < porPartes.length; i++){
        if(i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal,'i');
      pipeline.push({$match: { $or: [ { nro_cheque: regex }, { emisor: regex }, { 'banco.descripcion': regex } ] }});
			pipelineTotal.push({$match: { $or: [ { nro_cheque: regex }, { emisor: regex }, { 'banco.descripcion': regex } ] }});
      
		}


    // Ordenando datos
    const ordenar: any = {};
    if (columna) {
      ordenar[String(columna)] = Number(direccion);
      pipeline.push({ $sort: ordenar });
    }

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    const [ cheques, chequesTotal ] = await Promise.all([
      this.chequesModel.aggregate(pipeline),
      this.chequesModel.aggregate(pipelineTotal),
    ])
  
    // Total en cheques
    let montoTotal = 0;
    chequesTotal.map( cheque => montoTotal += cheque.importe );

    return {
      cheques,
      totalItems: chequesTotal.length,
      montoTotal
    };

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

    const data = {
      nro_cheque,
      importe: this.redondear(importe, 2),
      emisor,
      banco,
      fecha_cobro: add(new Date(fecha_cobro), { hours: 3 }), // Fecha +3 horas
      creatorUser,
      updatorUser
    }

    // Nuevo cheque
    const nuevoCheque = new this.chequesModel(data);
    const chequeRes = await nuevoCheque.save();

    // Impacto en Caja - Cheques
    const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
    const nuevoSaldo = this.redondear(cajaChequeDB.saldo + importe, 2);
    await this.cajasModel.findByIdAndUpdate(cajaChequeDB._id, { saldo: nuevoSaldo });

    return chequeRes;

  }

  // Actualizar cheque
  async update(id: string, chequesUpdateDTO: ChequesUpdateDTO): Promise<ICheques> {

    const {
      importe,
      fecha_cobro,
      caja,
      updatorUser
    } = chequesUpdateDTO;

    const chequeDB = await this.chequesModel.findById(id);

    // Verificacion: El cheque no existe
    if (!chequeDB) throw new NotFoundException('El cheque no existe');

    const data: any = chequesUpdateDTO;

    if (fecha_cobro) data.fecha_cobro = add(new Date(fecha_cobro), { hours: 3 });
    if (importe) data.importe = this.redondear(importe, 2);

    if (chequeDB.estado === 'Creado' && data.estado === 'Cobrado') {

      // Impacto en saldo de caja -> CHEQUES y EFECTIVO
      const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
      const nuevoSaldoCheque = cajaChequeDB.saldo - chequeDB.importe;
      await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: nuevoSaldoCheque });


      const cajaDestinoDB = await this.cajasModel.findById(caja);
      const nuevoSaldoDestino = cajaDestinoDB.saldo + chequeDB.importe;
      await this.cajasModel.findByIdAndUpdate(caja, { saldo: nuevoSaldoDestino });

      // Movimientos -> En CHEQUES y DESTINO

      const dataMovimientoCheque = {
        descripcion: `COBRO DE CHEQUE #${chequeDB.nro_cheque}`,
        tipo: 'Haber',
        caja: '222222222222222222222222',
        monto: chequeDB.importe,
        saldo_anterior: cajaChequeDB.saldo,
        saldo_nuevo: nuevoSaldoCheque,
        venta_propia: '',
        recibo_cobro: '',
        cheque: chequeDB._id,
        observacion: `CHEQUES -> ${cajaDestinoDB.descripcion}`,
        creatorUser: updatorUser,
        updatorUser
      }

      const dataMovimientoDestino = {
        descripcion: `COBRO DE CHEQUE #${chequeDB.nro_cheque}`,
        tipo: 'Debe',
        caja,
        monto: chequeDB.importe,
        saldo_anterior: cajaDestinoDB.saldo,
        saldo_nuevo: nuevoSaldoDestino,
        venta_propia: '',
        recibo_cobro: '',
        cheque: chequeDB._id,
        observacion: `CHEQUES -> ${cajaDestinoDB.descripcion}`,
        creatorUser: updatorUser,
        updatorUser
      }

      const nuevoMovimientoCheque = new this.cajasMovimientosModel(dataMovimientoCheque);
      await nuevoMovimientoCheque.save()

      const nuevoMovimientoDestino = new this.cajasMovimientosModel(dataMovimientoDestino);
      await nuevoMovimientoDestino.save()

    }

    const cheque = await this.chequesModel.findByIdAndUpdate(id, data, { new: true });
    return cheque;

  }

  // Eliminar cheque
  async delete(id: string): Promise<ICheques> {

    const chequeDB = await this.chequesModel.findById(id);

    // Verificacion: El cheque no existe
    if (!chequeDB) throw new NotFoundException('El cheque no existe');

    // Impacto en Caja - Cheques
    const cajaChequeDB = await this.cajasModel.findById('222222222222222222222222');
    const nuevoSaldo = cajaChequeDB.saldo - chequeDB.importe;
    await this.cajasModel.findByIdAndUpdate('222222222222222222222222', { saldo: nuevoSaldo });

    const cheque = await this.chequesModel.findByIdAndDelete(id);
    return cheque;

  }

}
