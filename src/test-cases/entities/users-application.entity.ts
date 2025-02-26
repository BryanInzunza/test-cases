import { Application } from "./application.entity";
import { User } from "src/auth/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('ctl_usuarios_por_aplicaciones')
export class UsersApplication {

    @PrimaryGeneratedColumn('identity')
    idu: number;

    @Column()
    idu_usuario: number;

    @Column()
    idu_aplicacion: number;

    @ManyToOne(() => User, usuario => usuario.usuariosXAplicaciones)
    @JoinColumn({ name: 'idu_usuario' })
    usuario: User;

    @ManyToOne(() => Application, { nullable: false })
    @JoinColumn({ name: 'idu_aplicacion' })
    aplicacion: Application;

}