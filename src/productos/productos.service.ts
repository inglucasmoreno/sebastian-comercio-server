import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IFamiliaProductos } from 'src/familia-productos/interface/familia-productos.interface';
import { IUnidadMedida } from 'src/unidad-medida/interface/unidad-medida.interface';
import { ProductosUpdateDTO } from './dto/productos-update.dto';
import { ProductosDTO } from './dto/productos.dto';
import { IProductos } from './interface/productos.interface';

@Injectable()
export class ProductosService {

  constructor(
    @InjectModel('Productos') private readonly productosModel: Model<IProductos>,
    @InjectModel('UnidadMedida') private readonly unidadesMedidaModel: Model<IUnidadMedida>,
    @InjectModel('FamiliaProductos') private readonly familiaProductosModel: Model<IFamiliaProductos>,
    ){}

  // Producto por ID
  async getId(id: string): Promise<IProductos> {

    const productoDB = await this.productosModel.findById(id);
    if(!productoDB) throw new NotFoundException('El producto no existe');

    const pipeline = [];

    const idProducto= new Types.ObjectId(id);
    pipeline.push({ $match:{ _id: idProducto} }); 

    // Informacion de familia del producto
    pipeline.push({
      $lookup: { // Lookup
          from: 'familia_productos',
          localField: 'familia',
          foreignField: '_id',
          as: 'familia'
      }}
    );

    pipeline.push({ $unwind: '$familia' });

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
  async getAll(querys: any): Promise<any> {
        
    const {
						columna, 
						direccion,
						desde,
						registerpp,
						activo,
						parametro,
            alerta_stock = 'false',
            alerta_cantidad_negativa = 'false'
		} = querys;

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

    // Informacion de familia del producto
    pipeline.push({
      $lookup: { // Lookup
          from: 'familia_productos',
          localField: 'familia',
          foreignField: '_id',
          as: 'familia'
      }}
    );

    pipeline.push({ $unwind: '$familia' });

    pipelineTotal.push({
      $lookup: { // Lookup
          from: 'familia_productos',
          localField: 'familia',
          foreignField: '_id',
          as: 'familia'
      }}
    );

    pipelineTotal.push({ $unwind: '$familia' });

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
 
		// Filtro por parametros
		if(parametro && parametro !== ''){
			
      const porPartes = parametro.split(' ');
      let parametroFinal = '';

      for(var i = 0; i < porPartes.length; i++){
        if(i > 0) parametroFinal = parametroFinal + porPartes[i] + '.*';
        else parametroFinal = porPartes[i] + '.*';
      }

      const regex = new RegExp(parametroFinal,'i');
      pipeline.push({$match: { $or: [ { codigo: regex }, { descripcion: regex }, { 'familia.descripcion': regex } ] }});
			pipelineTotal.push({$match: { $or: [ { codigo: regex }, { descripcion: regex }, { 'familia.descripcion': regex } ] }});
      
		}

    // Paginacion
    if(alerta_stock === 'true' || alerta_cantidad_negativa === 'true') pipeline.push({$skip: Number(0)}, {$limit: Number(100000)});
    else pipeline.push({$skip: Number(desde)}, {$limit: Number(registerpp)});
     
		// Busqueda de productos
		let [productos, productosTotal, unidades_medida, familias] = await Promise.all([
			this.productosModel.aggregate(pipeline),
			this.productosModel.aggregate(pipelineTotal),
      this.unidadesMedidaModel.find({activo: true}).sort({ descripcion: 1 }),
      this.familiaProductosModel.find({activo: true}).sort({ descripcion: 1 }),
		]);

    // Filtro por alerta de stock
    if(alerta_stock === 'true'){
      productos = productos.filter( producto => (producto.stock_minimo_alerta && (producto.cantidad <= producto.cantidad_minima)));
      productosTotal = productosTotal.filter( producto => (producto.stock_minimo_alerta && (producto.cantidad <= producto.cantidad_minima)));
    }

    // Filtro por cantidad negativa
    if(alerta_cantidad_negativa === 'true'){
      productos = productos.filter( producto => (producto.cantidad < 0));
      productosTotal = productosTotal.filter( producto => (producto.cantidad < 0));
    }
    
    return {
			productos,
      unidades_medida,
      familias,
			totalItems: (alerta_stock === 'true' || alerta_cantidad_negativa === 'true') ? productos.length : productosTotal.length
		};

  }
  
  // Crear producto
  async insert(productoDTO: ProductosDTO): Promise<IProductos> {
    
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
  async update(id: string, productoUpdateDTO: ProductosUpdateDTO): Promise<IProductos> {
  
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
