import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICompras } from 'src/compras/interface/compras.interface';
import { ComprasProductosDTO } from './dto/compras-productos.dto';
import { IComprasProductos } from './interface/compras-productos.interface';

@Injectable()
export class ComprasProductosService {

  constructor(
    @InjectModel('ComprasProductos') private readonly comprasProductosModel: Model<IComprasProductos>,
    @InjectModel('Compras') private readonly comprasModel: Model<ICompras>,
  ) { };

  // Relacion por ID
  async getId(id: string): Promise<IComprasProductos> {

    // Se verifica que la relacion existe
    const relacionDB = await this.comprasProductosModel.findById(id);
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const pipeline = [];

    // Relacion por ID
    const idRelacion = new Types.ObjectId(id);
    pipeline.push({ $match: { _id: idRelacion } })

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

    const relaciones = await this.comprasProductosModel.aggregate(pipeline);

    return relaciones[0];

  }

  // Listar relaciones
  async getAll(querys: any): Promise<IComprasProductos[]> {

    const { columna, direccion, compra } = querys;

    const pipeline = [];
    pipeline.push({ $match: {} });

    // Listar por compra
    if (compra && compra !== '') {
      const idCompra = new Types.ObjectId(compra);
      pipeline.push({ $match: { compra: idCompra } })
    }

    // Informacion de producto
    pipeline.push({
      $lookup: { // Lookup
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    }
    );

    pipeline.push({ $unwind: '$producto' });

    // Informacion de unidad de medida
    pipeline.push({
      $lookup: { // Lookup
        from: 'unidad_medida',
        localField: 'producto.unidad_medida',
        foreignField: '_id',
        as: 'producto.unidad_medida'
      }
    }
    );

    pipeline.push({ $unwind: '$producto.unidad_medida' });

    // Informacion de famili
    pipeline.push({
      $lookup: { // Lookup
        from: 'familia_productos',
        localField: 'producto.familia',
        foreignField: '_id',
        as: 'producto.familia'
      }
    }
    );

    pipeline.push({ $unwind: '$producto.familia' });

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

    const productos = await this.comprasProductosModel.aggregate(pipeline);

    return productos;

  }

  // Crear relacion
  async insert(comprasProductosDTO: ComprasProductosDTO): Promise<IComprasProductos> {
    const nuevaRelacion = new this.comprasProductosModel(comprasProductosDTO);
    return await nuevaRelacion.save();
  }

  // Actualizar compra
  async update(id: string, comprasProductosUpdateDTO: any): Promise<IComprasProductos> {

    const relacionDB = await this.comprasProductosModel.findById(id);

    // Verificacion: La relacion no existe
    if (!relacionDB) throw new NotFoundException('La relacion no existe');

    const relacion = await this.comprasProductosModel.findByIdAndUpdate(id, comprasProductosUpdateDTO, { new: true });
    return relacion;

  }

  // Actualizar relaciones
  async updateRelaciones(dataProductos: any): Promise<any> {

    if (dataProductos.length <= 0) throw new NotFoundException('No hay productos cargados');

    let precioTotal = 0;

    // Precio total
    dataProductos.map(data => precioTotal += data.precio_total);

    // Actualizacion de productos
    dataProductos.map(async data => await this.comprasProductosModel.findByIdAndUpdate(data._id, data));

    await this.comprasModel.findByIdAndUpdate(dataProductos[0].compra, { precio_total: precioTotal });

    return 'Actualizacion correcta';

  }

  // Eliminar producto
  async delete(id: string): Promise<IComprasProductos> {
    const producto = await this.comprasProductosModel.findByIdAndRemove(id);
    return producto;
  }


}
