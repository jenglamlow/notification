import { ChannelType } from './channel-type.enum';

export interface NotificationResult {
  success: boolean;
  channelsSent: ChannelType[];
  channelsFailed: ChannelType[];
  message: string;
}

export interface NotificationContext {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    id: string;
    name: string;
  };
  [key: string]: any;
}
