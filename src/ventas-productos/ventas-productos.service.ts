import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentas } from 'src/ventas/interface/ventas.interface';
import { VentaProductosUpdateDTO } from './dto/ventas-productos-update.dto';
import { VentaProductosDTO } from './dto/ventas-productos.dto';
import { IVentaProductos } from './interface/ventas-productos.interface';

@Injectable()
export class VentasProductosService {

  constructor(
    @InjectModel('VentaProductos') private readonly productosModel: Model<IVentaProductos>,
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,   
  ){};

    // Venta por ID
    async getId(id: string): Promise<IVentaProductos> {

        // Se verifica si el producto existe
        const productoDB = await this.productosModel.findById(id);
        if(!productoDB) throw new NotFoundException('El producto no existe'); 

        const pipeline = [];

        // Producto por ID
        const idProducto = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idProducto } }); 

        // Informacion de venta
        pipeline.push({
            $lookup: { // Lookup
                from: 'ventas',
                localField: 'venta',
                foreignField: '_id',
                as: 'venta'
            }}
        );

        pipeline.push({ $unwind: '$venta' });

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
    async getAll(querys: any): Promise<IVentaProductos[]> {

        const {columna, direccion, venta} = querys;

        const pipeline = [];
        pipeline.push({$match:{}});

        // Listar por venta
        if(venta && venta !== ''){
            const idVenta = new Types.ObjectId(venta);
            pipeline.push({ $match:{ venta: idVenta } })        
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
    async insert(productosDTO: VentaProductosDTO): Promise<IVentaProductos[]> {
        
        // Se agrega un producto
        const nuevoProducto = new this.productosModel(productosDTO);
        await nuevoProducto.save();

        // Se devuelven todos los productos del presupuesto
        const productos = await this.productosModel.find({ venta: productosDTO.venta }).sort({ descripcion: 1 });

        return productos;

    }  

    // Actualizar producto
    async update(id: string, productoUpdateDTO: VentaProductosUpdateDTO): Promise<IVentaProductos[]> {

        const productoDB = await this.productosModel.findById(id);
        
        // Verificacion: El producto no existe
        if(!productoDB) throw new NotFoundException('El producto no existe');

        await this.productosModel.findByIdAndUpdate(id, productoUpdateDTO, {new: true});

        // Se devuelven todos los productos del presupuesto
        const productos = await this.productosModel.find({ venta: productoUpdateDTO.venta }).sort({ descripcion: 1 });      

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

        await this.ventasModel.findByIdAndUpdate(dataProductos[0].venta, { precio_total: precioTotal });

        return 'Actualizacion correcta';
        
    }     


    // Eliminar producto
    async delete(id: string): Promise<IVentaProductos> {
        const producto = await this.productosModel.findByIdAndRemove(id);
        return producto;
    }


}
