import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

@Schema({ collection: 'notification_templates' })
export class NotificationTemplate {
  // e.g., 'happy-birthday'
  @Prop({ required: true, index: true })
  type: string;

  // e.g., 'email', 'ui'
  @Prop({ required: true, index: true })
  channel: string;

  // Allows for company-specific overrides. null = system default.
  @Prop({ type: String, default: null, index: true })
  companyId: string | null;

  @Prop()
  subject?: string;

  @Prop({ required: true })
  content: string;
}

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);
NotificationTemplateSchema.index(
  // compound index: type ASC, channel ASC, companyId ASC
  { type: 1, channel: 1, companyId: 1 },
  { unique: true },
);
