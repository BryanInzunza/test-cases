import { IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSeguimientoDto {

    @IsString()
    @IsNotEmpty()
    nom_tabla: string;
  
    @IsString()
    @IsNotEmpty()
    nom_accion: string;
  
    @IsString()
    @IsNotEmpty()
    idu_usuario: string;
  
    @IsOptional()
    @IsJSON()
    identificador_registro?: any;
  
    @IsOptional()
    @IsJSON()
    valores_anteriores?: any;
  
    @IsOptional()
    @IsJSON()
    valores_nuevos?: any;
  
}
