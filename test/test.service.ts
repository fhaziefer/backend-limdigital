// test/test.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../src/common/prisma.service";
import { User } from "@prisma/client";
import * as bcrypt from 'bcrypt'

@Injectable()
export class TestService {
    private readonly logger = new Logger(TestService.name);

    constructor(private prismaService: PrismaService) { }

    /**
     * Create a test user with default or custom values
     */
    async createTestUser(options?: {
        username?: string;
        password?: string;
        email?: string;
    }): Promise<User> {
        const defaultUser = {
            username: "test.debug",
            password: "TestDebug123",
            email: "test@debug.com"
        };
    
        const userData = { ...defaultUser, ...options };
    
        return this.prismaService.user.create({
            data: {
                username: userData.username,
                email: userData.email,
                passwordHash: await bcrypt.hash(userData.password, 10),
                isActive: true,
                profile: {
                    create: {
                        fullName: userData.username || "Test User"
                    }
                }
            }
        });
    }

    /**
     * Delete test user and all related data safely
     */
    async deleteTestUser(username: string = "test.debug"): Promise<void> {
        try {
            this.logger.log(`Starting deletion of ${username} user...`);

            await this.prismaService.$transaction(async (prisma) => {
                // 1. Find the test user
                const user = await prisma.user.findUnique({
                    where: { username },
                    select: { id: true }
                });

                if (!user) {
                    this.logger.warn(`${username} user not found, skipping deletion`);
                    return;
                }

                this.logger.log(`Found ${username} user with ID: ${user.id}`);

                // 2. Delete all related sessions
                await prisma.session.deleteMany({
                    where: { userId: user.id }
                });
                this.logger.log(`Deleted all sessions for ${username} user`);

                // 3. Delete profile
                await prisma.profile.deleteMany({
                    where: { userId: user.id }
                });
                this.logger.log(`Deleted profile for ${username} user`);

                // 4. Finally delete the user
                await prisma.user.delete({
                    where: { id: user.id }
                });
                this.logger.log(`Successfully deleted ${username} user`);
            });
        } catch (error) {
            this.logger.error(`Failed to delete ${username} user`, error.stack);
            throw error;
        }
    }

    /**
     * Clean up all test data (more comprehensive cleanup)
     */
    async cleanDatabase(usernames: string[] = ["test.debug"]): Promise<void> {
        try {
            this.logger.log('Starting database cleanup...');

            await this.prismaService.$transaction([
                // Delete in optimal order to avoid constraint errors
                this.prismaService.session.deleteMany({
                    where: { user: { username: { in: usernames } } }
                }),
                this.prismaService.profile.deleteMany({
                    where: { user: { username: { in: usernames } } }
                }),
                this.prismaService.user.deleteMany({
                    where: { username: { in: usernames } }
                })
            ]);

            this.logger.log('Database cleanup completed successfully');
        } catch (error) {
            this.logger.error('Database cleanup failed', error.stack);
            throw error;
        }
    }

    /**
     * Get test user by username
     */
    async getTestUser(username: string = "test.debug"): Promise<User | null> {
        return this.prismaService.user.findUnique({
            where: { username },
            include: { profile: true, sessions: true }
        });
    }

    async deactivateUser(username: string): Promise<void> {
        await this.prismaService.user.update({
            where: { username },
            data: { isActive: false }
        });
    }

    async changePassword(username: string, newPassword: string): Promise<void> {
        await this.prismaService.user.update({
            where: { username },
            data: { 
                passwordHash: await bcrypt.hash(newPassword, 10),
                passwordChangedAt: new Date() 
            }
        });
    }    

}