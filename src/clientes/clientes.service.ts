import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientesUpdateDTO } from './dto/clientes-update.dto';
import { ClientesDTO } from './dto/clientes.dto';
import { IClientes } from './interface/clientes.interface';

@Injectable()
export class ClientesService {

    constructor(@InjectModel('Clientes') private readonly clientesModel: Model<IClientes>) { };

    // Cliente por ID
    async getId(id: string): Promise<IClientes> {

        // Se verifica si el cliente existe
        const clientesDB = await this.clientesModel.findById(id);
        if (!clientesDB) throw new NotFoundException('El cliente no existe');

        const pipeline = [];

        // Cliente por ID
        const idCliente = new Types.ObjectId(id);
        pipeline.push({ $match: { _id: idCliente } });

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

        const cliente = await this.clientesModel.aggregate(pipeline);

        return cliente[0];

    }

    // Cliente por Identificacion
    async getIdentificacion(identificacion: string): Promise<IClientes> {

        const pipeline = [];

        // Cliente por identificacion
        pipeline.push({ $match: { identificacion } });

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

        const cliente = await this.clientesModel.aggregate(pipeline);

        return cliente[0];

    }

    // Listar clientes
    async getAll(querys: any): Promise<any> {

        const {
            columna,
            direccion,
            desde,
            registerpp,
            parametro,
            activo
        } = querys;

        const pipeline = [];
        const pipelineTotal = [];

        pipeline.push({ $match: {} });
        pipelineTotal.push({ $match: {} });

        // FILTRO - Activo / Inactivo
        let filtroActivo = {};
        if (activo && activo !== '') {
            filtroActivo = { activo: activo === 'true' ? true : false };
            pipeline.push({ $match: filtroActivo });
            pipelineTotal.push({ $match: filtroActivo });
        }

        // FILTRO - Por parametros
        if (parametro && parametro !== '') {

            const porPartes = parametro.split(' ');
            let parametroFinal = '';

            for (var i = 0; i < porPartes.length; i++) {
                if (i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
                else parametroFinal = porPartes[i] + '.*';
            }

            const regex = new RegExp(parametroFinal, 'i');
            pipeline.push({ $match: { $or: [{ descripcion: regex }, { identificacion: regex }] } });
            pipelineTotal.push({ $match: { $or: [{ descripcion: regex }, { identificacion: regex }] } });

        }

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

        // Ordenando datos
        const ordenar: any = {};
        if (columna) {
            ordenar[String(columna)] = Number(direccion);
            pipeline.push({ $sort: ordenar });
        }

        // Paginacion
        pipeline.push({ $skip: Number(desde) }, { $limit: Number(registerpp) });

        // Generacion de resultados
        const [clientes, clientesTotal] = await Promise.all([
            this.clientesModel.aggregate(pipeline),
            this.clientesModel.aggregate(pipelineTotal),
        ]);

        return {
            clientes: clientes.filter(cliente => String(cliente._id) !== '000000000000000000000000'),
            totalItems: clientes.length > 0 ? clientesTotal.length - 1 : 0
        }

    }

    // Crear cliente
    async insert(clientesDTO: ClientesDTO): Promise<IClientes> {

        // El cliente ya se encuentra cargado
        const clienteDB = await this.clientesModel.findOne({ identificacion: clientesDTO.identificacion });
        if (clienteDB) throw new NotFoundException('El cliente ya se encuentra cargado');

        const nuevoCliente = new this.clientesModel(clientesDTO);
        return await nuevoCliente.save();

    }

    // Actualizar cliente
    async update(id: string, clientesUpdateDTO: ClientesUpdateDTO): Promise<IClientes> {

        const { identificacion } = clientesUpdateDTO;

        const clienteDB = await this.clientesModel.findById(id);

        // Verificacion: El cliente no existe
        if (!clienteDB) throw new NotFoundException('El cliente no existe');

        // Verificamos que la identificacion no este repetido
        if (identificacion && clienteDB.identificacion !== identificacion) {
            const clienteRepetido = await this.clientesModel.findOne({ identificacion });
            if (clienteRepetido) throw new NotFoundException('La identificación ya se encuentra cargada');
        }

        const cliente = await this.clientesModel.findByIdAndUpdate(id, clientesUpdateDTO, { new: true });
        return cliente;

    }

}
