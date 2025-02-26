import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Application } from './application.entity';

@Entity('mov_escaneos')
export class Scan {
    @PrimaryGeneratedColumn('identity')
    idu_escaneo: number;

    @Column({ type: 'varchar', length: 255 })
    nom_escaneo: string;

    @Column({ type: 'varchar', length: 20 })
    nom_directorio: string;

    @ManyToOne(() => Application, { nullable: false })
    @JoinColumn({ name: 'idu_aplicacion' })
    application: Application;
}