import { Injectable } from '@nestjs/common';
import { INotificationChannel } from './channel.interface';
import { EmailChannel } from './implementations/email.channel';
import { UiChannel } from './implementations/ui.channel';
import { ChannelType } from 'src/common/types/channel-type.enum';

@Injectable()
export class ChannelFactory {
  constructor(
    private readonly emailChannel: EmailChannel,
    private readonly uiChannel: UiChannel,
  ) {}

  public getChannel(channelType: ChannelType): INotificationChannel {
    switch (channelType) {
      case ChannelType.EMAIL:
        return this.emailChannel;
      case ChannelType.UI:
        return this.uiChannel;
      default:
        throw new Error(`Channel type ${channelType} not supported.`);
    }
  }
}
