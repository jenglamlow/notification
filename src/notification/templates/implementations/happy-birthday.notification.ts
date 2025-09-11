import { Injectable } from '@nestjs/common';
import { AbstractNotification } from '../abstract-notification';
import { NotificationType } from 'src/common/types/notification-type.enum';
import { ChannelType } from 'src/common/types/channel-type.enum';
import { User, Company } from 'src/common/types/user.types';

@Injectable()
export class HappyBirthdayNotification extends AbstractNotification {
  getType(): NotificationType {
    return NotificationType.HAPPY_BIRTHDAY;
  }

  getDefaultChannels(): ChannelType[] {
    return [ChannelType.EMAIL, ChannelType.UI];
  }

  getTemplateContext(user: User, company: Company): Record<string, any> {
    const age = this._calculateAge(user.dateOfBirth);
    return {
      // Base context
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      companyName: company.name,
      // Birthday-specific context
      age,
    };
  }

  private _calculateAge(dateOfBirth?: Date): number {
    if (!dateOfBirth) return 0;
    const birth = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const birthdayThisYear = new Date(
      today.getFullYear(),
      birth.getMonth(),
      birth.getDate(),
    );

    // if today is before this year's birthday, the person hasn't had their birthday yet
    if (today < birthdayThisYear) age--;

    return age;
  }
}
