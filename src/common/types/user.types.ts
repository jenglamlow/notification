import { ChannelType } from './channel-type.enum';

export interface Company {
  id: string;
  name: string;
  subscribeChannels: ChannelType[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscribeChannels: ChannelType[];
  companyId: string;
  leaveBalance?: number;
  dateOfBirth?: Date;
  salary?: number;
}
