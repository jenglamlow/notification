import { Injectable, Logger } from '@nestjs/common';
import { ChannelContent, INotificationChannel } from '../channel.interface';
import { User } from 'src/common/types/user.types';

@Injectable()
export class EmailChannel implements INotificationChannel {
  private readonly logger = new Logger(EmailChannel.name);

  async send(user: User, data: ChannelContent): Promise<void> {
    this.logger.log('--- Sending Email ---');
    this.logger.log(`Recipient: ${user.email}`);
    this.logger.log(`Subject: ${data.subject}`);
    this.logger.log(`Content: ${data.content}`);
    this.logger.log('--- Email Sent ---');
  }
}
