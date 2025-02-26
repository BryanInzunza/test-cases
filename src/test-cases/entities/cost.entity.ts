import { Application } from "./application.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('mov_costos_proyectos')
export class Cost {

    @PrimaryGeneratedColumn()
    keyx: number;

    @Column({ type: 'bigint' })
    num_empleado: bigint;

    @Column({ type: 'bigint' })
    id_proyecto: bigint;

    @Column({ type: 'varchar', length: 100 })
    nom_proyecto: string;

    @Column({ type: 'character', length: 25 })
    nom_cliente_ia: string;

    @Column({ type: 'numeric', precision: 15, scale: 2 })
    val_monto: string;

    @Column({ type: 'text' })
    des_descripcion: string;

    @ManyToOne(() => Application, { nullable: false })
    @JoinColumn({ name: 'id_proyecto', referencedColumnName: 'idu_proyecto' })
    application: Application;

}