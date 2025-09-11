import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { NotificationType } from 'src/common/types/notification-type.enum';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsEnum(NotificationType, {
    message: `type must be one of: ${Object.values(NotificationType).join(', ')}`,
  })
  type: NotificationType;
}

export class GetUiNotificationsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
