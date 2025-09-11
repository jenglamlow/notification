import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  SendNotificationDto,
  GetUiNotificationsDto,
} from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    try {
      await this.notificationService.sendNotification(sendNotificationDto);
      return { message: 'Notification sent successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to send notification: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to process notification request',
      );
    }
  }

  @Get('ui/:userId')
  async getUiNotifications(@Param() params: GetUiNotificationsDto) {
    try {
      const notifications = await this.notificationService.getUiNotifications(
        params.userId,
      );
      return {
        data: notifications,
        count: notifications.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get UI notifications for user ${params.userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve notifications',
      );
    }
  }
}
