import { User } from '../common/types/user.types';

export interface ChannelContent {
  subject?: string;
  content: string;
}

export interface INotificationChannel {
  send(user: User, data: ChannelContent): Promise<void>;
}