import { Application } from "../../test-cases/entities/application.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('ctl_checkmarx')
export class Checkmarx {

    @PrimaryGeneratedColumn('identity')
    idu_checkmarx: number;

    @Column({ type: 'varchar', length: 255 })
    nom_checkmarx: string;

    @Column({ type: 'varchar', length: 255 })
    nom_directorio: string;

    @ManyToOne(() => Application, { nullable: false })
    @JoinColumn({ name: 'idu_aplicacion' })
    application: Application;

}