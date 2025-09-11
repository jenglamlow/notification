import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { TemplateService } from './template.service';
import { NotificationTemplate } from '../database/schemas/notification-template.schema';
import { NotificationType } from '../common/types/notification-type.enum';
import { ChannelType } from '../common/types/channel-type.enum';

describe('TemplateService', () => {
  let service: TemplateService;
  let templateModel: jest.Mocked<Model<NotificationTemplate>>;
  let cacheManager: jest.Mocked<Cache>;

  const mockDefaultTemplate = {
    type: NotificationType.LEAVE_BALANCE_REMINDER,
    channel: ChannelType.EMAIL,
    companyId: null,
    subject: 'Default Subject',
    content: 'Default Content',
  };

  const mockCompanyTemplate = {
    type: NotificationType.LEAVE_BALANCE_REMINDER,
    channel: ChannelType.EMAIL,
    companyId: 'company-b',
    subject: 'Company B Subject',
    content: 'Company B Content',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        {
          provide: getModelToken(NotificationTemplate.name),
          useValue: {
            find: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    templateModel = module.get(getModelToken(NotificationTemplate.name));
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplate', () => {
    it('should return a company-specific template if one exists', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(undefined);
      const mockExec = jest
        .fn()
        .mockResolvedValue([mockCompanyTemplate, mockDefaultTemplate]);
      templateModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: mockExec,
      } as any);

      // Act
      const result = await service.getTemplate(
        NotificationType.LEAVE_BALANCE_REMINDER,
        ChannelType.EMAIL,
        'company-b',
      );

      // Assert
      expect(result).toEqual({
        subject: mockCompanyTemplate.subject,
        content: mockCompanyTemplate.content,
      });
      expect(templateModel.find).toHaveBeenCalledWith({
        type: NotificationType.LEAVE_BALANCE_REMINDER,
        channel: ChannelType.EMAIL,
        $or: [{ companyId: 'company-b' }, { companyId: null }],
      });
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should fall back to the default template if no company-specific one is found', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(undefined);
      const mockExec = jest.fn().mockResolvedValue([mockDefaultTemplate]);
      templateModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: mockExec,
      } as any);

      // Act
      const result = await service.getTemplate(
        NotificationType.LEAVE_BALANCE_REMINDER,
        ChannelType.EMAIL,
        'company-a',
      );

      // Assert
      expect(result).toEqual({
        subject: mockDefaultTemplate.subject,
        content: mockDefaultTemplate.content,
      });
      expect(templateModel.find).toHaveBeenCalled();
    });

    it('should return null if no template is found at all', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(undefined);
      const mockExec = jest.fn().mockResolvedValue([]); // No templates found
      templateModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: mockExec,
      } as any);

      // Act
      const result = await service.getTemplate(
        'non-existent-type' as any,
        ChannelType.EMAIL,
        'company-a',
      );

      // Assert
      expect(result).toBeNull();
      expect(templateModel.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        null,
        expect.any(Number),
      ); // Caches null result
    });

    it('should return a cached template without hitting the database', async () => {
      // Arrange
      const cachedResult = {
        subject: 'Cached Subject',
        content: 'Cached Content',
      };
      cacheManager.get.mockResolvedValue(cachedResult);

      // Act
      const result = await service.getTemplate(
        NotificationType.HAPPY_BIRTHDAY,
        ChannelType.UI,
        'company-a',
      );

      // Assert
      expect(result).toEqual(cachedResult);
      expect(cacheManager.get).toHaveBeenCalledWith(
        'template:happy-birthday:ui:company-a',
      );
      expect(templateModel.find).not.toHaveBeenCalled();
    });
  });
});
