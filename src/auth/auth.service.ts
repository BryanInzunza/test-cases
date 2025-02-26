import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { PositionsService } from '../positions/positions.service';
import { JwtPayload } from './interfaces';
import { SeguimientoService } from 'src/seguimiento/seguimiento.service';
import { CreateSeguimientoDto } from 'src/seguimiento/dto/create-seguimiento.dto';
import { CommonService } from 'src/common/common.service';



@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly positionService: PositionsService,
    private readonly jwtService: JwtService,
    private readonly seguimientoService: SeguimientoService,
    private readonly encryptionService: CommonService
  ) {}

  async findAll() {
    
    const usuarios = await this.userRepository.find();

    usuarios.map(usuario => {
      usuario.nom_correo = this.encryptionService.decrypt(usuario.nom_correo);
      usuario.nom_usuario = this.encryptionService.decrypt(usuario.nom_usuario);
      usuario.position.nom_rol = this.encryptionService.decrypt(usuario.position.nom_rol);
      return usuarios;
    });

    return usuarios;
  }

  async findAllActiveUsers(){

    const usuarios = await this.userRepository.find({ where: { opc_es_activo: true }});

    const usuariosDesencriptados = usuarios.map(usuario => ({
      ...usuario,
      nom_correo: this.encryptionService.decrypt(usuario.nom_correo),
      nom_usuario: this.encryptionService.decrypt(usuario.nom_usuario),
      position: {
        ...usuario.position,
        nom_rol: this.encryptionService.decrypt(usuario.position.nom_rol),
      }
    }));

    return usuariosDesencriptados;
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOneBy({ idu_usuario:id });
    if( !user )
      throw new NotFoundException(`Usuario con ${id} no encontrado `);

    user.nom_usuario = this.encryptionService.decrypt(user.nom_usuario);
    user.nom_correo = this.encryptionService.decrypt(user.nom_correo);
    user.position.nom_rol = this.encryptionService.decrypt(user.position.nom_rol);
    
    return user;
  }

  async create( createUserDto: CreateUserDto) {
    
    try {

      const { nom_contrasena,nom_correo, nom_usuario, ...userData } = createUserDto;
      
      const position = await this.positionService.findOne( createUserDto.idu_rol );

      if( await this.checkEmailExist( nom_correo ) )
        throw new BadRequestException('El correo ya existe');

      const user = this.userRepository.create({
        ...userData,
        nom_correo: this.encryptionService.encrypt(createUserDto.nom_correo),
        nom_usuario: this.encryptionService.encrypt(createUserDto.nom_usuario),
        nom_contrasena: bcrypt.hashSync( nom_contrasena, 10 ),
        position: position
      });

      await this.userRepository.save( user )
      delete user.nom_contrasena;

      user.nom_correo = this.encryptionService.decrypt(user.nom_correo);
      user.nom_usuario = this.encryptionService.decrypt(user.nom_usuario);

      return {
        ...user,
        token: this.getJwtToken({ id: user.idu_usuario })
      };


    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async login( loginUserDto: LoginUserDto ) {

    const { nom_contrasena, num_empleado } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { num_empleado },
      select: { num_empleado:true, nom_correo: true, nom_contrasena: true, idu_usuario: true, nom_usuario:true },
      relations: ['position']
    });

    if ( !user ) 
      throw new UnauthorizedException('Número de empleado no válido');
      
    if ( !bcrypt.compareSync( nom_contrasena, user.nom_contrasena ) )
      throw new UnauthorizedException('Contraseña no válida');


    const { nom_contrasena: _, ...userWithoutPassword } = user;
    userWithoutPassword.nom_correo = this.encryptionService.decrypt(userWithoutPassword.nom_correo);
    userWithoutPassword.nom_usuario = this.encryptionService.decrypt(userWithoutPassword.nom_usuario);

    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.idu_usuario }) 
    };
  }

  async checkAuthStatus( user: User ){
    const token = await this.getJwtToken({ id: user.idu_usuario });
    return {
      ...user,
      token: token
    };

  }

  async delete( id: string, user: User ){
    
    if( `${user.idu_usuario}` === id)
      throw new ForbiddenException(`Cannot delete self. ${id}`);

    const userData = await this.userRepository.findOneBy({ idu_usuario:id });
    if( !userData )
      throw new NotFoundException(`User with ${id} not found `);

    const seguimientoDto: CreateSeguimientoDto = {
      nom_tabla: 'cat_colaboladores',
      nom_accion: 'DELETE',
      idu_usuario: user.idu_usuario,
      identificador_registro: { idu_usuario: user.idu_usuario },
      valores_anteriores: { opc_es_activo: userData.opc_es_activo },
      valores_nuevos: { opc_es_activo: !userData.opc_es_activo }
    };

    await this.seguimientoService.create(seguimientoDto);

    userData.opc_es_activo = !userData.opc_es_activo;

    const appDelete =  await this.userRepository.save(userData);

    return appDelete;

  }

  async update(id:string, updateUserDto: UpdateUserDto, userInfo: User){

    try {
      const user = await this.userRepository.findOneBy({ idu_usuario:id });
     
      if( !user || user === null || user === undefined) 
        throw new NotFoundException(`Usuario con ${id} no encontrado `);
      
      const usuario_anterior = {...user};
      if (updateUserDto.nom_contrasena) {
        
        user.nom_contrasena = bcrypt.hashSync(updateUserDto.nom_contrasena, 10);
        
      }
  
      if (updateUserDto.idu_rol) {
        const position = await this.positionService.findOne( updateUserDto.idu_rol );
        if( !position ) throw new NotFoundException(`Rol con ${updateUserDto.idu_rol} no encontrado `);
        user.position = position;
      }

      if(updateUserDto.nom_correo) updateUserDto.nom_correo = this.encryptionService.encrypt(updateUserDto.nom_correo);
      if(updateUserDto.nom_usuario) updateUserDto.nom_usuario = this.encryptionService.encrypt(updateUserDto.nom_usuario);

      const { nom_contrasena, idu_rol, ...otherUpdates } = updateUserDto;
      Object.assign(user, otherUpdates);

      const seguimientoDto: CreateSeguimientoDto = {
        nom_tabla: 'usuarios',
        nom_accion: 'UPDATE',
        idu_usuario: userInfo.idu_usuario,
        identificador_registro: { idu_usuario: user.idu_usuario },
        valores_anteriores: usuario_anterior,
        valores_nuevos: user
      };
  
      await this.seguimientoService.create(seguimientoDto);

      await this.userRepository.save(user);

      user.nom_usuario = this.encryptionService.decrypt(user.nom_usuario);

      return user;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );
    return token;

  }

  private async checkEmailExist(correo: string): Promise<boolean> {
    try {

      const users = await this.userRepository.find();

      const emailExists = users.some(user => 
        this.encryptionService.decrypt(user.nom_correo) === correo
      );

      return emailExists;
  
    } catch (error) {

      this.handleDBErrors(error);
      return false;
    }
  }
  

  private handleDBErrors( error: any ): never {

    if ( error.code === '23505' || error.code === '42703' ){
      if(error.detail.includes('num_empleado')){
        throw new BadRequestException( "El número de empleado ya existe" );
      }
      throw new BadRequestException( error.detail );
    }

    if ( error instanceof NotFoundException )
      throw error;

    if( error.status && error.status == 400)
      throw new BadRequestException( error.response );

    throw new InternalServerErrorException('Please check server logs');

  }

}
