// src/undangan/undangan.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { UndanganService } from './undangan.service';
import { CreateUndanganRequest } from 'src/model/letter.model';

@Controller('undangan')
export class UndanganController {
    constructor(private readonly undanganService: UndanganService) { }

    @Post()
    async create(@Body() createUndanganRequest: CreateUndanganRequest) {
        return this.undanganService.generateUndangan(createUndanganRequest);
    }
}