import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  // Gestión errores por consola en nest
  private readonly logger = new Logger('ProductsService');

  constructor(
    // Inyectar repositorio para manejar el objeto de la DB
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    // Configuración predefinida a DB. Permite varias conexiones o transacciones
    private readonly dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const {images = [], ...productDetails} = createProductDto;

      // Genera el producto siguiendo el modelo de Product
      const product = this.productRepository.create({
        ...productDetails,
        user,
        // Mapear imágenes con la info tabla imágenes
        images: images.map((image)=>{
          return this.productImageRepository.create({url: image});
        })
      });
      // Inserta el producto en la DB
      await this.productRepository.save(product);
      return {...product, images};
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit, 
      skip: offset,
      // Permite cargar relaciones
      relations: {
        images: true
      }
    });
    // TODO: Relaciones
    return products.map((product) => ({
      ...product,
      images: product.images.map(img => img.url)
    }));
  }

  async findOne(param: string) {
    let product: Product;

    if(isUUID(param)){
      product = await this.productRepository.findOneBy({ id: param });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: param.toUpperCase(), 
          slug: param.toLowerCase()
        })
        .leftJoinAndSelect('product.images', 'productImages')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Producto con id ${param} no encontrado`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({id,...toUpdate, user});

    if(!product) throw new NotFoundException(`Producto con id ${id} no encontrado`);    

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    // Conexión e inicio transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      if(images) {
        // Elimina las imágenes con id producto igual al id que se pasa por param
        await queryRunner.manager.delete(ProductImage, {product: {id}});
        // Transforma las imágenes del producto añadiendo una instancia de productImages para relación
        product.images = images.map(image => this.productImageRepository.create({url: image}));
      }
      // Guarda la data
      await queryRunner.manager.save(product);
      // Commit de la transacción si no ha dado errores
      await queryRunner.commitTransaction();
      // Lanza la transacción contra la DB
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(param: string) {
    const product = await this.productRepository.delete(param);
    if(product.affected === 0) throw new NotFoundException(`Producto con id ${param} no encontrado`)
    return `Se ha eliminado el producto con id ${param}`;
  }



  // Helpers

  handleDBExceptions(error: any){
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    console.log(this.logger.error(error));
    throw new InternalServerErrorException('Error creando producto, resiva logs del servidor')
  }

  async findOnePlain(term: string) {
    const {images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder();
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
