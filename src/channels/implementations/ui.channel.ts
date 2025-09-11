import { Injectable, Logger } from '@nestjs/common';
import { ChannelContent, INotificationChannel } from '../channel.interface';
import { User } from 'src/common/types/user.types';
import { UINotificationRepository } from 'src/notification/notification.repository';

@Injectable()
export class UiChannel implements INotificationChannel {
  private readonly logger = new Logger(UiChannel.name);

  constructor(
    private readonly uiNotificationRepository: UINotificationRepository,
  ) {}

  async send(user: User, data: ChannelContent): Promise<void> {
    this.logger.log(`Storing UI notification for user ${user.id}`);
    await this.uiNotificationRepository.create({
      userId: user.id,
      content: data.content,
      read: false,
    });
    this.logger.log('--- UI Notification Stored ---');
  }
}
