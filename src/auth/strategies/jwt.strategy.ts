import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,

        configService: ConfigService,
        private readonly encryptionService: CommonService
    ) {

        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }


    async validate( payload: JwtPayload ): Promise<User> {
        
        const { id } = payload;

        const user = await this.userRepository.findOneBy({ idu_usuario:id });

        user.nom_correo = this.encryptionService.decrypt(user.nom_correo);
        user.nom_usuario = this.encryptionService.decrypt(user.nom_usuario);
        user.position.nom_rol = this.encryptionService.decrypt(user.position.nom_rol);

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')
            
        if ( !user.opc_es_activo ) 
            throw new UnauthorizedException('User is inactive, talk with an admin');
        
        return user;
    }

}