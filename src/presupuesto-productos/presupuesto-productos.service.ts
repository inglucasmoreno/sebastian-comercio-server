import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IPresupuestoProductos } from './interface/presupuesto-productos.interface';
import { PresupuestoProductosDTO } from './dto/presupuesto-productos.dto';
import { PresupuestoProductosUpdateDTO } from './dto/presupuesto-productos-update.dto';
import { IPresupuestos } from 'src/presupuestos/interface/presupuestos.interface';

@Injectable()
export class PresupuestoProductosService {

    constructor(
        @InjectModel('PresupuestoProductos') private readonly productosModel: Model<IPresupuestoProductos>,
        @InjectModel('Presupuestos') private readonly presupuestosModel: Model<IPresupuestos>,   
    ){};

    // Producto por ID
    async getId(id: string): Promise<IPresupuestoProductos> {

        // Se verifica si el producto existe
        const productoDB = await this.productosModel.findById(id);
        if(!productoDB) throw new NotFoundException('El producto no existe'); 

        const pipeline = [];

        // Producto por ID
        const idProducto = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idProducto } }); 

        // Informacion de presupuesto
        pipeline.push({
            $lookup: { // Lookup
                from: 'presupuestos',
                localField: 'presupuesto',
                foreignField: '_id',
                as: 'presupuesto'
            }}
        );

        pipeline.push({ $unwind: '$presupuesto' });

        // Informacion de producto
        pipeline.push({
            $lookup: { // Lookup
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }}
        );

        pipeline.push({ $unwind: '$producto' });

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

        const producto = await this.productosModel.aggregate(pipeline);

        return producto[0];    

    }

    // Listar productos
    async getAll(querys: any): Promise<IPresupuestoProductos[]> {

        const {columna, direccion, presupuesto} = querys;

        const pipeline = [];
        pipeline.push({$match:{}});

        // Listar por presupuesto
        if(presupuesto && presupuesto !== ''){
            const idPresupuesto = new Types.ObjectId(presupuesto);
            pipeline.push({ $match:{ presupuesto: idPresupuesto } })        
        }

        pipeline.push({ $unwind: '$producto' });

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

        const productos = await this.productosModel.aggregate(pipeline);

        return productos;


    }    

    // Crear producto
    async insert(productosDTO: PresupuestoProductosDTO): Promise<IPresupuestoProductos[]> {
        
        // Se agrega un producto
        const nuevoProducto = new this.productosModel(productosDTO);
        await nuevoProducto.save();

        // Se devuelven todos los productos del presupuesto
        const productos = await this.productosModel.find({ presupuesto: productosDTO.presupuesto }).sort({ descripcion: 1 });

        return productos;

    }  

    // Actualizar producto
    async update(id: string, productoUpdateDTO: PresupuestoProductosUpdateDTO): Promise<IPresupuestoProductos[]> {

        const productoDB = await this.productosModel.findById(id);
        
        // Verificacion: El producto no existe
        if(!productoDB) throw new NotFoundException('El producto no existe');

        await this.productosModel.findByIdAndUpdate(id, productoUpdateDTO, {new: true});

        // Se devuelven todos los productos del presupuesto
        const productos = await this.productosModel.find({ presupuesto: productoUpdateDTO.presupuesto }).sort({ descripcion: 1 });      

        return productos;
        
    } 

    // Actualizar productos
    async updateProductos(dataProductos: any): Promise<any> {

        if(dataProductos.length <= 0) throw new NotFoundException('No hay productos cargados');
        
        let precioTotal = 0;

        // Precio total
        dataProductos.map( data => precioTotal += data.precio_total);

        // Actualizacion de productos
        dataProductos.map( async data => await this.productosModel.findByIdAndUpdate(data._id, data));

        await this.presupuestosModel.findByIdAndUpdate(dataProductos[0].presupuesto, { precio_total: precioTotal });

        return 'Actualizacion correcta';
        
    }     

    // Eliminar producto
    async delete(id: string): Promise<IPresupuestoProductos> {
        const producto = await this.productosModel.findByIdAndRemove(id);
        return producto;
    }

}
