import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientesUpdateDTO } from './dto/clientes-update.dto';
import { ClientesDTO } from './dto/clientes.dto';
import { IClientes } from './interface/clientes.interface';

@Injectable()
export class ClientesService {

    constructor(@InjectModel('Clientes') private readonly clientesModel: Model<IClientes>){};

    // Cliente por ID
    async getId(id: string): Promise<IClientes> {

        // Se verifica si el cliente existe
        const clientesDB = await this.clientesModel.findById(id);
        if(!clientesDB) throw new NotFoundException('El cliente no existe'); 

        const pipeline = [];

        // Cliente por ID
        const idCliente = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idCliente } }); 

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

        const cliente = await this.clientesModel.aggregate(pipeline);

        return cliente[0];    

    }

    // Listar clientes
    async getAll(querys: any): Promise<IClientes[]> {

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

        const clientes = await this.clientesModel.aggregate(pipeline);

        return clientes;

    }    

    // Crear cliente
    async insert(clientesDTO: ClientesDTO): Promise<IClientes> {
        const nuevoCliente = new this.clientesModel(clientesDTO);
        return await nuevoCliente.save();
    }  

    // Actualizar cliente
    async update(id: string, clientesUpdateDTO: ClientesUpdateDTO): Promise<IClientes> {

        const { descripcion, activo } = clientesUpdateDTO;

        const clienteDB = await this.clientesModel.findById(id);
        
        // Verificacion: El cliente no existe
        if(!clienteDB) throw new NotFoundException('El cliente no existe');

        const cliente = await this.clientesModel.findByIdAndUpdate(id, clientesUpdateDTO, {new: true});
        return cliente;
        
    } 

}
