import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProveedoresUpdateDTO } from './dto/proveedores-update.dto';
import { ProveedoresDTO } from './dto/proveedores.dto';
import { IProveedores } from './interface/proveedores.interface';

@Injectable()
export class ProveedoresService {

    constructor(@InjectModel('Proveedores') private readonly proveedoresModel: Model<IProveedores>) { };

    // Proveedor por ID
    async getId(id: string): Promise<IProveedores> {

        // Se verifica si el proveedor existe
        const proveedoresDB = await this.proveedoresModel.findById(id);
        if (!proveedoresDB) throw new NotFoundException('El proveedore no existe');

        const pipeline = [];

        // Proveedore por ID
        const idProveedor = new Types.ObjectId(id);
        pipeline.push({ $match: { _id: idProveedor } });

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

        const proveedores = await this.proveedoresModel.aggregate(pipeline);

        return proveedores[0];

    }

    // Listar proveedores
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
        const [proveedores, proveedoresTotal] = await Promise.all([
            this.proveedoresModel.aggregate(pipeline),
            this.proveedoresModel.aggregate(pipelineTotal),
        ]);

        return {
            proveedores: proveedores.filter(proveedor => String(proveedor._id) !== '000000000000000000000000'),
            totalItems: proveedores.length > 0 ? proveedoresTotal.length - 1 : 0
        }

    }

    // Crear proveedor
    async insert(proveedoresDTO: ProveedoresDTO): Promise<IProveedores> {

        // La razon social ya se encuentra cargada
        if (proveedoresDTO.descripcion.trim() !== '') {
            const proveedorDB = await this.proveedoresModel.findOne({ descripcion: proveedoresDTO.descripcion });
            if (proveedorDB) throw new NotFoundException('La razon social ya se encuentra cargada');
        }

        // La identificacion ya se encuentra cargada
        if (proveedoresDTO.identificacion.trim() !== '') {
            const proveedorDB = await this.proveedoresModel.findOne({ identificacion: proveedoresDTO.identificacion });
            if (proveedorDB) throw new NotFoundException('La identificación ya se encuentra cargada');
        }

        const nuevoProveedor = new this.proveedoresModel(proveedoresDTO);
        return await nuevoProveedor.save();

    }

    // Actualizar proveedor
    async update(id: string, proveedoresUpdateDTO: ProveedoresUpdateDTO): Promise<IProveedores> {

        const { descripcion, identificacion } = proveedoresUpdateDTO;

        const proveedorDB = await this.proveedoresModel.findById(id);

        // Verificacion: El proveedor no existe
        if (!proveedorDB) throw new NotFoundException('El proveedor no existe');

        // Verificacion: Razon social repetida
        if (identificacion && proveedorDB.identificacion !== identificacion) {
            const proveedorRepetido = await this.proveedoresModel.findOne({ identificacion });
            if (proveedorRepetido) throw new NotFoundException('La identificación ya se encuentra cargada');
        }

        // Verificacion: Identificacion repetida
        if (descripcion && proveedorDB.descripcion !== descripcion) {
            const proveedorRepetido = await this.proveedoresModel.findOne({ descripcion });
            if (proveedorRepetido) throw new NotFoundException('La razon social ya se encuentra cargada');
        }

        const proveedor = await this.proveedoresModel.findByIdAndUpdate(id, proveedoresUpdateDTO, { new: true });
        return proveedor;

    }

}
