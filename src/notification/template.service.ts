import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from 'src/database/schemas/notification-template.schema';
import { NotificationType } from 'src/common/types/notification-type.enum';
import { ChannelType } from 'src/common/types/channel-type.enum';

export type Template = { subject?: string; content: string };

@Injectable()
export class TemplateService {
  private readonly CACHE_TTL = 3600;
  private readonly CACHE_PREFIX = 'template';

  constructor(
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplateDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Finds the best matching template for a given notification type, channel, and company.
   * It first looks for a company-specific template and falls back to the system default.
   * Uses caching for production performance.
   * @param type The notification type, e.g., NotificationType.HAPPY_BIRTHDAY
   * @param channel The channel, e.g., ChannelType.EMAIL
   * @param companyId The ID of the company to check for overrides
   */
  async getTemplate(
    type: NotificationType,
    channel: ChannelType,
    companyId: string,
  ): Promise<Template | null> {
    // Generate cache key
    const cacheKey = `${this.CACHE_PREFIX}:${type}:${channel}:${companyId}`;

    // Check cache first
    const cachedTemplate = await this.cacheManager.get<Template | null>(
      cacheKey,
    );
    if (cachedTemplate !== undefined) {
      return cachedTemplate;
    }

    // Look for company-specific first, then system default
    const templates = await this.templateModel
      .find({
        type,
        channel,
        $or: [{ companyId }, { companyId: null }],
      })
      .sort({ companyId: -1 }) // Non-null companyId comes first (company-specific takes priority)
      .limit(2)
      .exec();

    // Find the best match: company-specific first, then system default
    let template = templates.find((t) => t.companyId === companyId);
    if (!template) {
      template = templates.find((t) => t.companyId === null);
    }

    const result = template
      ? {
          subject: template.subject,
          content: template.content,
        }
      : null;

    // Cache the result (including null results to avoid repeated DB hits)
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  // A one-time seeding method to populate the database with default templates
  async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        type: NotificationType.HAPPY_BIRTHDAY,
        channel: ChannelType.EMAIL,
        subject: 'Happy Birthday {{firstName}}',
        content: '{{companyName}} is wishing you a happy birthday',
        companyId: null,
      },
      {
        type: NotificationType.HAPPY_BIRTHDAY,
        channel: ChannelType.UI,
        content: 'Happy Birthday {{firstName}}',
        companyId: null,
      },
      {
        type: NotificationType.MONTHLY_PAYSLIP,
        channel: ChannelType.EMAIL,
        subject: 'Your {{payPeriod}} Payslip is Ready - {{payslipId}}',
        content:
          'Dear {{firstName}},\n\nYour payslip for is now available.\n\nGross Salary: {{salary}}\n\nPlease download your payslip from the HR portal.\n\nBest regards,\n{{companyName}} Payroll Team',
        companyId: null,
      },
      {
        type: NotificationType.LEAVE_BALANCE_REMINDER,
        channel: ChannelType.UI,
        content:
          'Hi {{firstName}}! You have {{leaveBalance}} leave days remaining.',
        companyId: null,
      },
      // Example of a company-specific override for leave balance
      {
        type: NotificationType.HAPPY_BIRTHDAY,
        channel: ChannelType.EMAIL,
        subject: 'Important: {{firstName}}, Your Birthday is Coming Up!',
        content:
          'Dear {{firstName}},\n\nThe entire team at {{companyName}} wishes you a wonderful {{age}}th birthday!\n\nWarm regards,\nThe {{companyName}} Team',
        companyId: 'company-b',
      },
    ];

    // Populate DB, upsert to prevent duplicate when rerun (idempotency)
    for (const t of defaultTemplates) {
      await this.templateModel.updateOne(
        { type: t.type, channel: t.channel, companyId: t.companyId },
        { $set: t },
        { upsert: true },
      );
    }
  }
}
