import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Sourcecode } from '../../sourcecode/entities/sourcecode.entity';
import { Applicationstatus } from "../../applicationstatus/entities/applicationstatus.entity";
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { User } from '../../auth/entities/user.entity';

@Entity('mae_aplicaciones')
export class Application {

    @PrimaryGeneratedColumn('identity')
    idu_aplicacion: number;

    @Column({ type: 'bigint' })
    idu_proyecto: string;

    @Column({ type: 'varchar', length: 255 })
    nom_aplicacion: string;

    @Column()
    @IsNumber()
    @Type(() => Number)
    num_accion: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_lenguaje: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_doc: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_doc_code: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_caso: number;

    @Column()
    @IsNumber()
    @Type(() => Number)
    opc_estatus_calificar: number;

    @Column({ type: 'jsonb', default: { "1": false, "2": false, "3": true, "4": false } })
    opc_arquitectura: Record<string, boolean>;

    @ManyToOne(
        () => Applicationstatus, applicationstatus => applicationstatus.application,
        { eager: true }
    )
    @JoinColumn({ name: 'clv_estatus' })
    applicationstatus: Applicationstatus;

    @ManyToOne(
        () => Sourcecode, sourcecode => sourcecode.application,
        { eager: true }
    )
    @JoinColumn({ name: 'idu_codigo_fuente' })
    sourcecode: Sourcecode;

    @ManyToOne(
        () => User, user => user.application,
        { eager: true }
    )
    @JoinColumn({ name: 'idu_usuario' })
    user: User;

    @Column({
        type: 'int',
        name: 'idu_usuario',
    })
    idu_usuario: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}