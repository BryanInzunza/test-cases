import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

@Entity()
export class TestCase {
    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_caso: number;
}
