import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Application } from '../../test-cases/entities/application.entity';

@Entity('ctl_estatus_aplicaciones')
export class Applicationstatus {

    @PrimaryGeneratedColumn('identity')
    idu_estatus_aplicacion: number;

    @Column({ type: 'varchar', length: 20 })
    des_estatus_aplicacion: string;

    @OneToMany(
        () => Application, application => application.applicationstatus,
    )
    application: Application[];
}