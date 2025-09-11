import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChannelFactory } from 'src/channels/channel.factory';
import { CompanyService } from 'src/external/company.service';
import { UserService } from 'src/external/user.service';
import { SendNotificationDto } from './dto/notification.dto';
import { renderTemplate } from 'src/common/utils/template.util';
import { UINotificationRepository } from './notification.repository';
import { UINotification } from 'src/database/schemas/ui-notification.schema';
import { TemplateService } from './template.service';
import { Company, User } from 'src/common/types/user.types';
import { AbstractNotification } from './templates/abstract-notification';
import { NotificationFactory } from './templates/notification.factory';
import { ChannelType } from 'src/common/types/channel-type.enum';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly channelFactory: ChannelFactory,
    private readonly notificationFactory: NotificationFactory,
    private readonly uiNotificationRepository: UINotificationRepository,
    private readonly templateService: TemplateService,
  ) {
    // Seed the database with default templates on application start
    this.templateService.seedDefaultTemplates();
  }

  private getSubscribedChannels(
    user: User,
    company: Company,
    notification: AbstractNotification,
  ): ChannelType[] {
    const defaultChannels = notification.getDefaultChannels();
    this.logger.debug(
      `Default channels for type "${notification.getType()}" are [${defaultChannels.join(', ')}]`,
    );

    // Use Sets for efficient intersection logic
    const companyAllowed = new Set(company.subscribeChannels);
    const userAllowed = new Set(user.subscribeChannels);

    const finalChannels = defaultChannels.filter(
      (channel) => companyAllowed.has(channel) && userAllowed.has(channel),
    );

    this.logger.log(
      `For user "${user.id}", the final channels for type "${notification.getType()}" are [${finalChannels.join(', ')}]`,
    );

    return finalChannels;
  }

  async sendNotification(dto: SendNotificationDto): Promise<void> {
    const { userId, companyId, type } = dto;

    this.logger.log(`Processing notification request: ${JSON.stringify(dto)}`);

    try {
      const notification = this.notificationFactory.getNotification(type);

      const [user, company] = await Promise.all([
        this.userService.findById(userId),
        this.companyService.findById(companyId),
      ]);

      // Get the final list of channels to use
      const targetChannels = this.getSubscribedChannels(
        user,
        company,
        notification,
      );

      if (targetChannels.length === 0) {
        this.logger.log(
          `No subscribed channels for notification type "${type}" for user "${userId}". Aborting.`,
        );
        return;
      }

      const templateContext = notification.getTemplateContext(user, company);

      // Process all channels in parallel asynchronously
      const channelPromises = targetChannels.map(async (channelType) => {
        try {
          const template = await this.templateService.getTemplate(
            type,
            channelType,
            company.id,
          );

          if (!template) {
            this.logger.warn(
              `Template not found for type "${type}" and channel "${channelType}". Skipping.`,
            );
            return;
          }

          const channel = this.channelFactory.getChannel(channelType);

          const payload = {
            type: type,
            content: renderTemplate(template.content, templateContext),
            subject: template.subject
              ? renderTemplate(template.subject, templateContext)
              : undefined,
          };

          await channel.send(user, payload);
          this.logger.log(
            `Successfully sent notification via "${channelType}" channel to user "${userId}"`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send via channel "${channelType}" for user "${userId}". Error: ${error.message}`,
            error.stack,
          );
        }
      });

      await Promise.allSettled(channelPromises);
      this.logger.log(
        `Completed processing notification request for user "${userId}"`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process notification request: ${JSON.stringify(dto)}. Error: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to let the controller handle it
    }
  }

  async getUiNotifications(userId: string): Promise<UINotification[]> {
    // First validate that the user exists
    await this.userService.findById(userId);

    // If user exists, fetch their UI notifications
    return this.uiNotificationRepository.findByUserId(userId);
  }
}
