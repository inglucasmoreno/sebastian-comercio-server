import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IVentasPropias } from 'src/ventas-propias/interface/ventas-propias.interface';
import { VentasPropiasProductosUpdateDTO } from './dto/ventas-propias-productos-update.dto';
import { VentasPropiasProductosDTO } from './dto/ventas-propias-productos.dto';
import { IVentasPropiasProductos } from './interface/ventas-propias-productos.interface';

@Injectable()
export class VentasPropiasProductosService {

  constructor(
    @InjectModel('VentasPropiasProductos') private readonly productosModel: Model<IVentasPropiasProductos>,
    @InjectModel('VentasPropias') private readonly ventasModel: Model<IVentasPropias>,   
  ){};

    // Venta propias por ID
    async getId(id: string): Promise<IVentasPropiasProductos> {

        // Se verifica si el producto existe
        const productoDB = await this.productosModel.findById(id);
        if(!productoDB) throw new NotFoundException('La venta propia no existe no existe'); 

        const pipeline = [];

        // Producto por ID
        const idProducto = new Types.ObjectId(id);
        pipeline.push({ $match:{ _id: idProducto } }); 

        // Informacion de venta
        pipeline.push({
            $lookup: { // Lookup
                from: 'ventas_propias',
                localField: 'venta_propia',
                foreignField: '_id',
                as: 'venta_propia'
            }}
        );

        pipeline.push({ $unwind: '$venta_propia' });

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
    async getAll(querys: any): Promise<IVentasPropiasProductos[]> {

        const {columna, direccion, venta} = querys;

        const pipeline = [];
        pipeline.push({$match:{}});

        // Listar por venta
        if(venta && venta !== ''){
            const idVenta = new Types.ObjectId(venta);
            pipeline.push({ $match:{ venta_propia: idVenta } })        
        }

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
    async insert(productosDTO: VentasPropiasProductosDTO): Promise<IVentasPropiasProductos[]> {
        
        // Se agrega un producto
        const nuevoProducto = new this.productosModel(productosDTO);
        await nuevoProducto.save();

        // Se devuelven todos los productos del presupuesto
        const productos = await this.productosModel.find({ venta: productosDTO.venta }).sort({ descripcion: 1 });

        return productos;

    }  

    // Actualizar producto
    async update(id: string, productoUpdateDTO: VentasPropiasProductosUpdateDTO): Promise<IVentasPropiasProductos[]> {

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
    async delete(id: string): Promise<IVentasPropiasProductos> {
        const producto = await this.productosModel.findByIdAndRemove(id);
        return producto;
    }


}
