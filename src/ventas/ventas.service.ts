import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IClientes } from 'src/clientes/interface/clientes.interface';
import { IVentaProductos } from 'src/ventas-productos/interface/ventas-productos.interface';
import { VentasDTO } from './dto/ventas.dto';
import { IVentas } from './interface/ventas.interface';
import * as fs from 'fs';
import * as pdf from 'pdf-creator-node';
import { format } from 'date-fns';

@Injectable()
export class VentasService {
  proveedoresModel: any;

  constructor(
    @InjectModel('Ventas') private readonly ventasModel: Model<IVentas>,
    @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
    @InjectModel('VentasProductos') private readonly ventaProductosModel: Model<IVentaProductos>,
  ){};

  // Venta por ID
  async getId(id: string): Promise<IVentas> {

      // Se verifica si la venta existe
      const ventaDB = await this.ventasModel.findById(id);
      if(!ventaDB) throw new NotFoundException('La venta no existe'); 

      const pipeline = [];

      // Venta por ID
      const idVenta = new Types.ObjectId(id);
      pipeline.push({ $match:{ _id: idVenta } }); 

      // Informacion de cliente
      pipeline.push({
          $lookup: { // Lookup
              from: 'clientes',
              localField: 'cliente',
              foreignField: '_id',
              as: 'cliente'
          }}
      );

      pipeline.push({ $unwind: '$cliente' });

      // Informacion de proveedor
      pipeline.push({
          $lookup: { // Lookup
              from: 'proveedores',
              localField: 'proveedor',
              foreignField: '_id',
              as: 'proveedor'
          }}
      );

      pipeline.push({ $unwind: '$proveedor' });

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

      const venta = await this.ventasModel.aggregate(pipeline);

      return venta[0];    

  }

  // Listar ventas
  async getAll(querys: any): Promise<IVentas[]> {

      const {columna, direccion} = querys;

      const pipeline = [];
      pipeline.push({$match:{}});

      // Informacion de cliente
      pipeline.push({
          $lookup: { // Lookup
              from: 'clientes',
              localField: 'cliente',
              foreignField: '_id',
              as: 'cliente'
          }}
      );

      pipeline.push({ $unwind: '$cliente' });

      // Informacion de proveedor
      pipeline.push({
          $lookup: { // Lookup
              from: 'proveedores',
              localField: 'proveedor',
              foreignField: '_id',
              as: 'proveedor'
          }}
      );

      pipeline.push({ $unwind: '$proveedor' });

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

      const ventas = await this.ventasModel.aggregate(pipeline);

      return ventas;

  }    

  // Crear venta
  async insert(ventasDTO: VentasDTO): Promise<any> {

      let {
          nro_factura, 
          tipo_venta,  
          cliente,
          cliente_descripcion,
          cliente_identificacion,
          cliente_tipo_identificacion,
          cliente_correo_electronico,
          cliente_condicion_iva,
          proveedor,
          observacion,
          precio_total,
          productos,
          creatorUser,
          updatorUser 
      } = ventasDTO;

      // SECCION CLIENTE

      if(cliente.trim() === '' && cliente.trim() !== '000000000000000000000000'){
          
          const clienteDB: any = await this.clientesModel.findOne({ identificacion: cliente_identificacion });
          
          if(!clienteDB){ // El cliente no existe en la BD -> SE CREA
              
              const nuevoCliente = new this.clientesModel({
                  descripcion: cliente_descripcion,
                  tipo_identificacion: cliente_tipo_identificacion,
                  identificacion: cliente_identificacion,
                  direccion: cliente_descripcion,
                  correo_electronico: cliente_correo_electronico,
                  condicion_iva: cliente_condicion_iva,
                  creatorUser,
                  updatorUser
              });
              
              const clienteRes = await nuevoCliente.save();
              cliente = clienteRes._id;
                              
          }else{ // El identificador esta registrado -> Se corrige      
              cliente = clienteDB._id;
              cliente_descripcion = clienteDB.descripcion;
              cliente_identificacion = clienteDB.identificacion;
              cliente_tipo_identificacion = clienteDB.tipo_identificacion;
              condicion_iva: clienteDB.condicion_iva;           
          }
      }

      // NRO DE VENTA

      let nroVenta: number = 0;

      const ventas = await this.ventasModel.find()
                                           .sort({createdAt: -1})
                                           .limit(1)

      ventas.length === 0 ? nroVenta = 1 : nroVenta = Number(ventas[0].nro + 1); 

      // GENERACION DE VENTA

      const dataVenta = {
          nro: nroVenta,
          nro_factura,
          tipo: tipo_venta,
          cliente,
          proveedor,
          precio_total,
          observacion,
          // descripcion,
          // tipo_identificacion,
          // identificacion,
          // direccion,
          // telefono,
          // correo_electronico,
          // condicion_iva,
          creatorUser,
          updatorUser     
      };
      
      const nuevaVenta = new this.ventasModel(dataVenta);
      const ventaDB = await nuevaVenta.save();
      
      // CARGA DE PRODUCTOS
      let productosVenta: any = productos;
      productosVenta.map( producto => producto.venta = String(ventaDB._id) )

      await this.ventaProductosModel.insertMany(productosVenta);
      
      // Generar PDF

      const venta = await this.getId(ventaDB._id);

      let html: any;

      html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/venta.html', 'utf-8');

      var options = {
          format: 'A4',
          orientation: 'portrait',
          border: '10mm',
          footer: {
              height: "35mm",
              contents: {
                  first: `
                      <p style="width: 100%; font-size: 9px; padding-bottom: 7px; padding:10px; border-top: 1px solid black; text-align:right; margin-bottom: 10px;"> <b style="background-color:#ECECEC; padding:10px; border-top: 1px solid black;"> Precio total: </b> <span style="background-color:#ECECEC; padding: 10px; border-top: 1px solid black;"> $${ Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ventaDB.precio_total) } </span> </p>
                      <p style="width: 100%; font-size: 8px; padding-bottom: 7px;"> <b> Observaciones </b> </p>
                      <p style="width: 100%; font-size: 8px;"> ${ ventaDB.observacion } </p>
                  `,
                  2: 'Second page',
                  default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
                  last: 'Last Page'
              }
          }  
      }

      let productosPDF: any[] = [];
      const productosMap: any = productos;

      // Adaptando productos
      productosMap.map( producto => productosPDF.push({
          descripcion: producto.descripcion,
          cantidad: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.cantidad),
          unidad_medida: producto.unidad_medida,
          precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
          precio_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_total)
      }));

      // Adaptando numero
      let mostrarNumero: string;
      const { nro } = ventaDB;
      if(nro <= 9)  mostrarNumero = 'VD000000' + String(nro);
      else if(nro <= 99) mostrarNumero = 'VD00000' + String(nro);
      else if(nro <= 999) mostrarNumero = 'VD0000' + String(nro);
      else if(nro <= 9999) mostrarNumero = 'VD000' + String(nro);
      else if(nro <= 99999) mostrarNumero = 'VD00' + String(nro);
      else if(nro <= 999999) mostrarNumero = 'VD0' + String(nro);

      const data = {
        fecha: format(venta.createdAt, 'dd/MM/yyyy'),
        numero: mostrarNumero,
        descripcion: venta.cliente['descripcion'],
        correo_electronico: venta.cliente['correo_electronico'],
        condicion_iva: venta.cliente['condicion_iva'],
        direccion: venta.cliente['direccion'],
        telefono: venta.cliente['telefono'],
        productos: productosPDF,
        total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(venta.precio_total)
      };

      // Configuraciones de documento
      var document = {
          html: html,
          data,
          path: (process.env.PUBLIC_DIR || './public') + '/pdf/venta.pdf'
      }

      // Generacion de PDF
      await pdf.create(document, options);

      return 'Venta creada correctamente';

  }  

  // Actualizar venta
  async update(id: string, ventasUpdateDTO: any): Promise<IVentas> {

      const ventaDB = await this.ventasModel.findById(id);
      
      // Verificacion: La venta no existe
      if(!ventaDB) throw new NotFoundException('La venta no existe');

      const venta = await this.ventasModel.findByIdAndUpdate(id, ventasUpdateDTO, {new: true});
      return venta;
      
  }

  // Generar PDF
  async generarPDF(dataFront: any): Promise<any> {

      // Promisa ALL
      const [ venta, productos ] = await Promise.all([
          this.getId(dataFront.venta),
          this.ventaProductosModel.find({ venta: dataFront.venta })
      ]); 

    //   const venta = await this.getId(dataFront.venta);
    //   const productos = await this.ventaProductosModel.find({ venta: dataFront.venta });

      let html: any;

      html = fs.readFileSync((process.env.PDF_TEMPLATE_DIR || './pdf-template') + '/venta.html', 'utf-8');
      
      let productosPDF: any[] = [];

      // Adaptando productos
      productos.map( producto => productosPDF.push({
          descripcion: producto.descripcion,
          cantidad: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.cantidad),
          unidad_medida: producto.unidad_medida,
          precio_unitario: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_unitario),
          precio_total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(producto.precio_total)
      }));

      // Adaptando numero
      let mostrarNumero: string;
      const { nro } = venta;
      if(nro <= 9)  mostrarNumero = 'VD000000' + String(nro);
      else if(nro <= 99) mostrarNumero = 'VD00000' + String(nro);
      else if(nro <= 999) mostrarNumero = 'VD0000' + String(nro);
      else if(nro <= 9999) mostrarNumero = 'VD000' + String(nro);
      else if(nro <= 99999) mostrarNumero = 'VD00' + String(nro);
      else if(nro <= 999999) mostrarNumero = 'VD0' + String(nro);

      const data = {
          fecha: format(venta.createdAt, 'dd/MM/yyyy'),
          numero: mostrarNumero,
          descripcion: venta.cliente['descripcion'],
          correo_electronico: venta.cliente['correo_electronico'],
          condicion_iva: venta.cliente['condicion_iva'],
          direccion: venta.cliente['direccion'],
          telefono: venta.cliente['telefono'],
          productos: productosPDF,
          total: Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(venta.precio_total)
      };

      var options = {
          format: 'A4',
          orientation: 'portrait',
          border: '10mm',
          footer: {
              height: "35mm",
              contents: {
                  first: `
                      <p style="width: 100%; font-size: 9px; padding-bottom: 7px; padding:10px; border-top: 1px solid black; text-align:right; margin-bottom: 10px;"> <b style="background-color:#ECECEC; padding:10px; border-top: 1px solid black;"> Precio total: </b> <span style="background-color:#ECECEC; padding: 10px; border-top: 1px solid black;"> $${data.total} </span> </p>
                      <p style="width: 100%; font-size: 8px; padding-bottom: 7px;"> <b> Observaciones </b> </p>
                      <p style="width: 100%; font-size: 8px;"> ${ venta.observacion } </p>
                  `,
                  2: 'Second page',
                  default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
                  last: 'Last Page'
              }
          }  
      }

      // Configuraciones de documento
      var document = {
          html: html,
          data,
          path: (process.env.PUBLIC_DIR || './public') + '/pdf/venta.pdf'
      }

      // Generacion de PDF
      await pdf.create(document, options);

      return '';

  }


}
