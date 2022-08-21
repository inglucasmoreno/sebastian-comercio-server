import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PresupuestosUpdateDTO } from './dto/presupuestos-update.dto';
import { PresupuestosDTO } from './dto/presupuestos.dto';
import { IPresupuestos } from './interface/presupuestos.interface';

@Injectable()
export class PresupuestosService {

    constructor(@InjectModel('Presupuestos') private readonly presupuestosModel: Model<IPresupuestos>){};

    // Presupuesto por ID
    async getId(id: string): Promise<IPresupuestos> {

        // Se verifica si el presupuesto existe
        const presupuestoDB = await this.presupuestosModel.findById(id);
        if(!presupuestoDB) throw new NotFoundException('El presupuesto no existe'); 

        const pipeline = [];

        // Presupuesto por ID
        const idPresupuesto = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idPresupuesto } }); 

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

        const presupuesto = await this.presupuestosModel.aggregate(pipeline);

        return presupuesto[0];    

    }

    // Listar presupuestos
    async getAll(querys: any): Promise<IPresupuestos[]> {

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

        const presupuestos = await this.presupuestosModel.aggregate(pipeline);

        return presupuestos;

    }    

    // Crear presupuesto
    async insert(presupuestosDTO: PresupuestosDTO): Promise<IPresupuestos> {
        const nuevoPresupuesto = new this.presupuestosModel(presupuestosDTO);
        return await nuevoPresupuesto.save();
    }  

    // Actualizar presupuesto
    async update(id: string, presupuestosUpdateDTO: PresupuestosUpdateDTO): Promise<IPresupuestos> {

        const presupuestoDB = await this.presupuestosModel.findById(id);
        
        // Verificacion: El presupuestos no existe
        if(!presupuestoDB) throw new NotFoundException('El presupuesto no existe');

        const presupuesto = await this.presupuestosModel.findByIdAndUpdate(id, presupuestosUpdateDTO, {new: true});
        return presupuesto;
        
    } 

}
