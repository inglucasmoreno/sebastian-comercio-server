import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProveedoresUpdateDTO } from './dto/proveedores-update.dto';
import { ProveedoresDTO } from './dto/proveedores.dto';
import { IProveedores } from './interface/proveedores.interface';

@Injectable()
export class ProveedoresService {

    constructor(@InjectModel('Proveedores') private readonly proveedoresModel: Model<IProveedores>){};

    // Proveedore por ID
    async getId(id: string): Promise<IProveedores> {

        // Se verifica si el proveedor existe
        const proveedoresDB = await this.proveedoresModel.findById(id);
        if(!proveedoresDB) throw new NotFoundException('El proveedore no existe'); 

        const pipeline = [];

        // Proveedore por ID
        const idProveedor = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idProveedor } }); 

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

        const proveedores = await this.proveedoresModel.aggregate(pipeline);

        return proveedores[0];    

    }

    // Listar proveedores
    async getAll(querys: any): Promise<IProveedores[]> {

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

        const proveedores = await this.proveedoresModel.aggregate(pipeline);

        return proveedores.filter(proveedor => String(proveedor._id) !== '000000000000000000000000');

    }    

    // Crear proveedor
    async insert(proveedoresDTO: ProveedoresDTO): Promise<IProveedores> {

        // El proveedor ya se encuentra cargado
        const proveedorDB = await this.proveedoresModel.findOne({ identificacion: proveedoresDTO.identificacion });
        if(proveedorDB) throw new NotFoundException('El proveedor ya se encuentra cargado');

        const nuevoProveedor = new this.proveedoresModel(proveedoresDTO);
        return await nuevoProveedor.save();
    }  

    // Actualizar proveedor
    async update(id: string, proveedoresUpdateDTO: ProveedoresUpdateDTO): Promise<IProveedores> {

        const { identificacion } = proveedoresUpdateDTO;

        const proveedorDB = await this.proveedoresModel.findById(id);
        
        // Verificacion: El proveedor no existe
        if(!proveedorDB) throw new NotFoundException('El proveedor no existe');

        // Verificamos que la identificacion no este repetido
        if(identificacion && proveedorDB.identificacion !== identificacion){
            const proveedorRepetido = await this.proveedoresModel.findOne({ identificacion });
            if(proveedorRepetido) throw new NotFoundException('La identificación ya se encuentra cargada');
        }

        const proveedor = await this.proveedoresModel.findByIdAndUpdate(id, proveedoresUpdateDTO, {new: true});
        return proveedor;
        
    } 

}
