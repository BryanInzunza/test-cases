import { Transform } from "class-transformer";
import { IsIn, IsNumber } from "class-validator";

export class CreateTestCases {
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsIn([3], {
        message: 'La opción debe ser 3',
    })
    opcArquitectura: number;
}
