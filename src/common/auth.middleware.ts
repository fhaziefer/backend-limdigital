import { Injectable, NestMiddleware } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private prismaService: PrismaService){

    }
    use(req: any, res: any, next: (error?: any) => void) {
        throw new Error("Method not implemented.");
    }
}