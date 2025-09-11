import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ChannelFactory } from 'src/channels/channel.factory';
import { EmailChannel } from 'src/channels/implementations/email.channel';
import { UiChannel } from 'src/channels/implementations/ui.channel';
import { CompanyService } from 'src/external/company.service';
import { UserService } from 'src/external/user.service';
import {
  UINotification,
  UINotificationSchema,
} from 'src/database/schemas/ui-notification.schema';
import { NotificationController } from './notification.controller';
import { UINotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { TemplateService } from './template.service';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from 'src/database/schemas/notification-template.schema';
import { NotificationFactory } from './templates/notification.factory';
import { HappyBirthdayNotification } from './templates/implementations/happy-birthday.notification';
import { MonthlyPayslipNotification } from './templates/implementations/monthly-payslip.notification';
import { LeaveBalanceReminderNotification } from './templates/implementations/leave-balance-reminder.notification';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UINotification.name, schema: UINotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
    ]),
    CacheModule.register({
      ttl: 3600,
      max: 1000,
    }),
  ],
  controllers: [NotificationController],
  providers: [
    // Core Service & Logic
    NotificationService,
    TemplateService,
    UINotificationRepository,

    // External Service Mocks
    UserService,
    CompanyService,

    // Channels & Factory
    ChannelFactory,
    EmailChannel,
    UiChannel,

    // Notifications & Factory
    NotificationFactory,
    HappyBirthdayNotification,
    MonthlyPayslipNotification,
    LeaveBalanceReminderNotification,
  ],
})
export class NotificationModule {}
