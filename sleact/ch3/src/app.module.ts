import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChannelsModule } from './channels/channels.module';
import { DmsModule } from './dms/dms.module';
import { UsersService } from './users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from '../ormconfig';
import { Users } from './entities/Users';
import { AuthModule } from './auth/auth.module';
import { Workspaces } from './entities/Workspaces';
import { WorkspaceMembers } from './entities/WorkspaceMembers';
import { ChannelMembers } from './entities/ChannelMembers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ChannelsModule,
    DmsModule,
    TypeOrmModule.forRoot(ormConfig),
    TypeOrmModule.forFeature([
      Users,
      Workspaces,
      WorkspaceMembers,
      ChannelMembers,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
