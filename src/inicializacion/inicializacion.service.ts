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
import { ICajas } from 'src/cajas/interface/cajas.interface';
import { ITiposMovimientos } from 'src/tipos-movimientos/interface/tipos-movimientos.interface';

@Injectable()
export class InicializacionService {
    
    constructor(
        @InjectModel('Usuario') private readonly usuarioModel: Model<IUsuario>,
        @InjectModel('Productos') private readonly productosModel: Model<IProductos>,
        @InjectModel('Clientes') private readonly clientesModel: Model<IClientes>,
        @InjectModel('Familias') private readonly familiaProductosModel: Model<IFamiliaProductos>,
        @InjectModel('UnidadMedida') private readonly unidadMedidaModel: Model<IUnidadMedida>,
        @InjectModel('Proveedores') private readonly proveedoresModel: Model<IProveedores>,
        @InjectModel('Cajas') private readonly cajasModel: Model<ICajas>,
        @InjectModel('TiposMovimientos') private readonly tiposMovimientosModel: Model<ITiposMovimientos>,
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

    // Inicializar cajas
    async initCajas(query: any): Promise<string> {

        // 1 - 000000000000000000000000 - Efectivo
        // 2 - 111111111111111111111111 - Dolares
        // 3 - 222222222222222222222222 - Cheques
        // 4 - 333333333333333333333333 - Banco provisorio

        const { usuario } = query;

        const verificacion = await this.cajasModel.findById('000000000000000000000000');
        if(verificacion) throw new NotFoundException('Los saldos ya se encuentran inicializados');

        const efectivo = new this.cajasModel({ 
            _id: '000000000000000000000000',
            descripcion: 'Efectivo', 
            saldo: 0,
            creatorUser: usuario,
            updatorUser: usuario 
        });

        const dolares = new this.cajasModel({ 
            _id: '111111111111111111111111',
            descripcion: 'Dolares', 
            saldo: 0,
            creatorUser: usuario,
            updatorUser: usuario 
        });

        const cheques = new this.cajasModel({ 
            _id: '222222222222222222222222',
            descripcion: 'Cheques', 
            saldo: 0,
            creatorUser: usuario,
            updatorUser: usuario 
        });

        const bancoProvisorio = new this.cajasModel({ 
            _id: '333333333333333333333333',
            descripcion: 'Banco provisorio', 
            saldo: 0,
            creatorUser: usuario,
            updatorUser: usuario 
        });

        await Promise.all([
            efectivo.save(),
            dolares.save(),
            cheques.save(),
            bancoProvisorio.save()
        ])

        return 'Inicializacion completada';

    }

    // Inicializar tipos de movimientos
    async initTiposMovimientos(query: any): Promise<string> {

        // 1 - 000000000000000000000000 - Ingreso

        const { usuario } = query;

        const verificacion = await this.tiposMovimientosModel.findById('000000000000000000000000');
        if(verificacion) throw new NotFoundException('Los tipos ya se encuentran inicializados');

        const ingreso = new this.tiposMovimientosModel({ 
            _id: '000000000000000000000000',
            descripcion: 'Ingreso', 
            saldo: 0,
            creatorUser: usuario,
            updatorUser: usuario 
        });

        await Promise.all([
            ingreso.save(),
        ])

        return 'Inicializacion completada';

    }

}
