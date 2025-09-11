import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractNotification } from './abstract-notification';
import { HappyBirthdayNotification } from './implementations/happy-birthday.notification';
import { LeaveBalanceReminderNotification } from './implementations/leave-balance-reminder.notification';
import { MonthlyPayslipNotification } from './implementations/monthly-payslip.notification';
import { NotificationType } from 'src/common/types/notification-type.enum';

@Injectable()
export class NotificationFactory {
  // Map lookups for notification handlers.
  private readonly notificationStrategies: Map<
    NotificationType,
    AbstractNotification
  > = new Map();

  constructor(
    private readonly happyBirthday: HappyBirthdayNotification,
    private readonly monthlyPayslip: MonthlyPayslipNotification,
    private readonly leaveReminder: LeaveBalanceReminderNotification,
  ) {
    this.register(happyBirthday);
    this.register(monthlyPayslip);
    this.register(leaveReminder);
  }

  // Register a notification strategy using its getType() key.
  private register(notification: AbstractNotification): void {
    this.notificationStrategies.set(notification.getType(), notification);
  }

  /**
   * Returns the notification handler for the given NotificationType.
   */
  public getNotification(type: NotificationType): AbstractNotification {
    const notification = this.notificationStrategies.get(type);

    if (!notification) {
      throw new NotFoundException(
        `Notification type "${type}" is not supported or registered.`,
      );
    }

    return notification;
  }
}
