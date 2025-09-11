import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UINotificationDocument = UINotification & Document;

@Schema({ timestamps: true, collection: 'ui_notifications' })
export class UINotification {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  read: boolean;
}

export const UINotificationSchema =
  SchemaFactory.createForClass(UINotification);
