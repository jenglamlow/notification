import { User, Company } from 'src/common/types/user.types';
import { NotificationType } from 'src/common/types/notification-type.enum';
import { ChannelType } from 'src/common/types/channel-type.enum';

export abstract class AbstractNotification {
  abstract getType(): NotificationType;
  abstract getDefaultChannels(): ChannelType[];

  abstract getTemplateContext(
    user: User,
    company: Company,
  ): Record<string, any>;
}
