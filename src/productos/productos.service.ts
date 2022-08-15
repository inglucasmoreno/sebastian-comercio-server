import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductosUpdateDTO } from './dto/productos-update.dto';
import { ProductosDTO } from './dto/productos.dto';
import { IProductos } from './interface/productos.interface';

@Injectable()
export class ProductosService {

  constructor(@InjectModel('Productos') private readonly productosModel: Model<IProductos>){}

  // Producto por ID
  async getProducto(id: string): Promise<IProductos> {

    const productoDB = await this.productosModel.findById(id);
    if(!productoDB) throw new NotFoundException('El producto no existe');

    const pipeline = [];

    const idProducto= new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idProducto} }); 

    // Informacion de unidad_medida
    pipeline.push({
      $lookup: { // Lookup
          from: 'unidad_medida',
          localField: 'unidad_medida',
          foreignField: '_id',
          as: 'unidad_medida'
      }}
    );

    pipeline.push({ $unwind: '$unidad_medida' });

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
  async listarProductos(querys: any): Promise<any> {
        
    const {
						columna, 
						direccion,
						desde,
						registerpp,
						activo,
						parametro
		} = querys;

		console.log(querys)

		// Pipelines
    const pipeline = [];
    const pipelineTotal = [];

    pipeline.push({$match:{}});
    pipelineTotal.push({$match:{}});

    // Ordenando datos
    const ordenar: any = {};
    if(columna){
        ordenar[String(columna)] = Number(direccion);
        pipeline.push({$sort: ordenar});
    }   

    // Activo / Inactivo
    let filtroActivo = {};
    if(activo && activo !== '') {
      filtroActivo = { activo: activo === 'true' ? true : false };
      pipeline.push({$match: filtroActivo});
      pipelineTotal.push({$match: filtroActivo});
    }

		// Filtro por parametros
		if(parametro && parametro !== ''){
			const regex = new RegExp(parametro, 'i');
			pipeline.push({$match: { $or: [ { codigo: regex }, { descripcion: regex } ] }});
			pipelineTotal.push({$match: { $or: [ { codigo: regex }, { descripcion: regex } ] }});
		}

    // Paginacion
    pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});

    // Informacion de unidad_medida
    pipeline.push({
      $lookup: { // Lookup
          from: 'unidad_medida',
          localField: 'unidad_medida',
          foreignField: '_id',
          as: 'unidad_medida'
      }}
    );

    pipeline.push({ $unwind: '$unidad_medida' });
    
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

		// Busqueda de productos
		const [productos, productosTotal] = await Promise.all([
			this.productosModel.aggregate(pipeline),
			this.productosModel.aggregate(pipelineTotal),
		]);
    
    return {
			productos,
			totalItems: productosTotal.length
		};

  }
  
  // Crear producto
  async crearProducto(productoDTO: ProductosDTO): Promise<IProductos> {
    
    // Verificacion: descripcion repetida
    const productoDescripcion = await this.productosModel.findOne({descripcion: productoDTO.descripcion.trim().toUpperCase()})
    if(productoDescripcion) throw new NotFoundException('El producto ya se encuentra cargada');

    // Verificacion de codigo repetido
    if(productoDTO.codigo && productoDTO.codigo !== ''){
      const productoDB = await this.productosModel.findOne({codigo: productoDTO.codigo});
      if(productoDB) throw new NotFoundException('Ya existe un producto con ese código');
    }
  
    const producto = new this.productosModel(productoDTO);

    return await producto.save();

  } 

  // Actualizar producto
  async actualizarProducto(id: string, productoUpdateDTO: ProductosUpdateDTO): Promise<IProductos> {
  
    const { descripcion } = productoUpdateDTO;

    // Verificacion: descripcion repetida
    if(descripcion){
      const productoDescripcion = await this.productosModel.findOne({descripcion: productoUpdateDTO.descripcion.trim().toUpperCase()})
      if(productoDescripcion && productoDescripcion._id.toString() !== id) throw new NotFoundException('El producto ya se encuentra cargada');
    }

    // Verificacion de codigo repetido
    if(productoUpdateDTO.codigo && productoUpdateDTO.codigo !== ''){
      const productoCodigo = await this.productosModel.findOne({codigo: productoUpdateDTO.codigo});
      if(productoCodigo && productoCodigo._id.toString() !== id) throw new NotFoundException('Ya existe un producto con ese código');
    }
    
    const producto = await this.productosModel.findByIdAndUpdate(id, productoUpdateDTO, {new: true});
  
    return producto;
  
  }

}
