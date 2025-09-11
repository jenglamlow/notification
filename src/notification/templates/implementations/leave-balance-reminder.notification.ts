import { Injectable } from '@nestjs/common';
import { AbstractNotification } from '../abstract-notification';
import { NotificationType } from 'src/common/types/notification-type.enum';
import { ChannelType } from 'src/common/types/channel-type.enum';
import { User, Company } from 'src/common/types/user.types';

@Injectable()
export class LeaveBalanceReminderNotification extends AbstractNotification {
  getType(): NotificationType {
    return NotificationType.LEAVE_BALANCE_REMINDER;
  }

  getDefaultChannels(): ChannelType[] {
    return [ChannelType.UI];
  }

  getTemplateContext(user: User, company: Company): Record<string, any> {
    const leaveData = user.leaveBalance || {};

    return {
      // Base context
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      companyName: company.name,
      // Leave-specific context
      leaveBalance: user.leaveBalance,
    };
  }
}
