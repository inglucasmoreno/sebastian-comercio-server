import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { IUsuario } from 'src/usuarios/interface/usuarios.interface';
import { IClientes } from 'src/clientes/interface/clientes.interface';
import { IProveedores } from 'src/proveedores/interface/proveedores.interface';
import { IProductos } from 'src/productos/interface/productos.interface';
import * as XLSX from 'xlsx';
import { IUnidadMedida } from 'src/unidad-medida/interface/unidad-medida.interface';
import { IFamiliaProductos } from 'src/familia-productos/interface/familia-productos.interface';
import { find } from 'rxjs';

@Injectable()
export class InicializacionService {
    
    constructor(
        @InjectModel('Usuario') private readonly usuarioModel: Model<IUsuario>,
        @InjectModel('Productos') private readonly productosModel: Model<IProductos>,
        @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
        @InjectModel('Familias') private readonly familiaProductosModel: Model<IFamiliaProductos>,
        @InjectModel('UnidadMedida') private readonly unidadMedidaModel: Model<IUnidadMedida>,
        @InjectModel('Proveedores') private readonly proveedoresModel: Model<IProveedores>,
    ){}

    async initUsuarios(): Promise<any> {
        
        // 1) - Verificacion
        const verificacion = await this.usuarioModel.find();
        if(verificacion.length != 0) throw new NotFoundException('Los usuarios ya fueron inicializados');

        // 2) - Se crea usuario administrador
        const data: any = {
            usuario: 'admin',
            apellido: 'Admin',
            nombre: 'Admin',
            dni: '34060399',
            email: 'admin@gmail.com',
            role: 'ADMIN_ROLE',
            activo: true
        }
    
        // Generacion de password encriptado
        const salt = bcryptjs.genSaltSync();
        data.password = bcryptjs.hashSync('admin', salt);
    
        // Se crea y se almacena en la base de datos al usuario administrador
        const usuario = new this.usuarioModel(data);
        await usuario.save();

        // Inicializacion de clientes - Tipo cliente: "Consumidor final"
        const cliente = new this.clientesModel({
            _id: '000000000000000000000000',
            tipo_identificacion: 'DNI',
            identificacion: 0,
            descripcion: 'Consumidor final',
            condicion_iva: 'Consumidor Final',
            creatorUser: usuario._id,
            updatorUser: usuario._id,
        });

        await cliente.save();

        // Inicializacion de proveedores - Tipo proveedor: "Sin especificar"
        const proveedor = new this.proveedoresModel({
            _id: '000000000000000000000000',
            tipo_identificacion: 'DNI',
            identificacion: 0,
            descripcion: 'SIN ESPECIFICAR',
            condicion_iva: 'Consumidor Final',
            creatorUser: usuario._id,
            updatorUser: usuario._id,
        });

        await proveedor.save();


    }

     // Se importan productos desde un documento de excel
     async importarProductos(query: any): Promise<any> {

        const { usuario } = query;
        let familia = '';
        let unidad = '';

        // Familia
        const familiaDB = await this.familiaProductosModel.findOne({ descripcion: 'GENERAL' });
        
        if(familiaDB){
            familia = String(familiaDB._id);
        }else{
            const crearFamilia = new this.familiaProductosModel({
                descripcion: 'GENERAL',
                creatorUser: usuario,
                updatorUser: usuario
            })
            const nuevaFamilia: any = await crearFamilia.save();
            familia = String(nuevaFamilia._id);
        }      
        
        // Unidad de medida
        const unidadMedidaDB = await this.unidadMedidaModel.findOne({ descripcion: 'UNIDAD' });
        
        if(unidadMedidaDB){
            unidad = String(unidadMedidaDB._id);
        }else{
            const crearUnidad = new this.unidadMedidaModel({
                descripcion: 'UNIDAD',
                creatorUser: usuario,
                updatorUser: usuario
            })
            const nuevaUnidad: any = await crearUnidad.save();
            unidad = String(nuevaUnidad._id);
        } 
        
        // Generacion de PDF

        const workbook = XLSX.readFile('./importar/productos.xlsx');
        const workbookSheets = workbook.SheetNames;
        const sheet = workbookSheets[0];
        const dataExcel: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

        // Verificacion de formato excel
        const condicion = dataExcel.length > 0 &&
                          dataExcel[0].CODIGO &&
                          dataExcel[0].DESCRIPCION

        if(!condicion) throw new NotFoundException('Excel con formato incorrecto');

        let registrosCargados = 0;

        for(const productoRec of dataExcel){

            let producto: any = productoRec;

            if(producto.CODIGO && producto.DESCRIPCION){
                
                const data = {
                    codigo: String(producto.CODIGO).toUpperCase(),
                    descripcion: String(producto.DESCRIPCION).toUpperCase(),
                    unidad_medida: unidad,
                    familia,
                    precio: null,
                    cantidad: 0,
                    stock_minimo_alerta: false,
                    cantidad_minima: 0,
                    creatorUser: usuario,
                    updatorUser: usuario,
                    activo: true
                }
                
                const productoDB = await this.productosModel.findOne({codigo: producto.CODIGO.toUpperCase()});

                if(!productoDB){
                    registrosCargados += 1;
                    const nuevoProducto = new this.productosModel(data);
                    await nuevoProducto.save();        
                }
            
            }

        }              

        if(registrosCargados === 0){
            return 'La base de productos ya se encuentra actualizada';
        }else{
            return `Cantidad de registros cargados: ${registrosCargados}`
        }


    }

}
