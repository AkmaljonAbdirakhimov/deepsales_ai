import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { CallsModule } from "./modules/calls/calls.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("database.host"),
        port: config.get<number>("database.port"),
        username: config.get<string>("database.username"),
        password: config.get<string>("database.password"),
        database: config.get<string>("database.name"),
        autoLoadEntities: true,
        synchronize: config.get<string>("app.env") !== "production",
      }),
    }),

    /**
     * Better Auth module — registers a global AuthGuard.
     * All routes are protected by default.
     * Use @AllowAnonymous() to open a route (e.g. webhooks).
     */
    AuthModule.forRoot({ auth }),

    TenantsModule,
    CallsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
