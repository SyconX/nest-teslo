import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: 'products'
})
export class Product {
    @ApiProperty({
        example: '07b09499-02dd-4f72-94bb-8c68903fe80f', 
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ApiProperty({
        example: 'Women\'s T Logo Long Sleeve Scoop Neck Tee', 
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;
    
    @ApiProperty({
        example: '12.3', 
        description: 'Product price',
        default: 0
    })
    @Column('float', {
        default: 0
    })
    price: number;
    
    @ApiProperty({
        example: 'Designed for style and comfort, the ultrasoft Women\'s T Logo Long Sleeve Scoop Neck Tee features a tonal 3D silicone-printed T logo on the left chest. Made of 50% Peruvian cotton and 50% Peruvian viscose.', 
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;
    
    @ApiProperty({
        example: 'women_t_logo_long_sleeve_scoop_neck_tee', 
        description: 'Product slug',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;
    
    @ApiProperty()
    @Column('int', {
        default: 0
    })
    stock: number;
    
    @ApiProperty()
    @Column('text', {
        array: true
    })
    sizes: string[];
    
    @ApiProperty()
    @Column('text')
    gender: string;
    
    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    // Relación imágenes
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    // Crea columna relación
    @ManyToOne(
        () => User, // Relación con la entidad
        (user) => user.product, // Columna a la que apunta
        { eager: true } 
    )
    user: User;


    @BeforeInsert()
    checkSlugInsert(){
        if( !this.slug ) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '')
    }
}
