import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UINotification,
  UINotificationDocument,
} from 'src/database/schemas/ui-notification.schema';

@Injectable()
export class UINotificationRepository {
  constructor(
    @InjectModel(UINotification.name)
    private readonly uiNotificationModel: Model<UINotificationDocument>,
  ) {}

  async create(notification: Partial<UINotification>): Promise<UINotification> {
    return this.uiNotificationModel.create(notification);
  }

  async findByUserId(userId: string): Promise<UINotification[]> {
    return this.uiNotificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
