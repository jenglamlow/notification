import { Injectable } from '@nestjs/common';
import { AbstractNotification } from '../abstract-notification';
import { NotificationType } from 'src/common/types/notification-type.enum';
import { ChannelType } from 'src/common/types/channel-type.enum';
import { User, Company } from 'src/common/types/user.types';

@Injectable()
export class MonthlyPayslipNotification extends AbstractNotification {
  getType(): NotificationType {
    return NotificationType.MONTHLY_PAYSLIP;
  }

  getDefaultChannels(): ChannelType[] {
    return [ChannelType.EMAIL];
  }

  getTemplateContext(user: User, company: Company): Record<string, any> {
    return {
      // Base context
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      companyName: company.name,
      // Payslip-specific context
      salary: user.salary,
    };
  }
}
