// src/session/session.module.ts
import { Module } from "@nestjs/common";
// Import komponen-komponen session
import { ScheduleModule } from "@nestjs/schedule";
import { SessionService } from "./session.service";
import { SessionRepository } from "./session.repository";
import { CommonModule } from "src/common/common.module";

@Module({
    imports: [CommonModule, ScheduleModule.forRoot()],
    providers: [SessionService, SessionRepository],
    exports: [SessionService]
})
export class SessionModule { }