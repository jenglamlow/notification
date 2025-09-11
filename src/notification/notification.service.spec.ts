import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserService } from '../external/user.service';
import { CompanyService } from '../external/company.service';
import { ChannelFactory } from '../channels/channel.factory';
import { NotificationFactory } from './templates/notification.factory';
import { UINotificationRepository } from './notification.repository';
import { TemplateService } from './template.service';
import { SendNotificationDto } from './dto/notification.dto';
import { INotificationChannel } from '../channels/channel.interface';
import { AbstractNotification } from './templates/abstract-notification';
import { NotificationType } from 'src/common/types/notification-type.enum';
import { ChannelType } from 'src/common/types/channel-type.enum';

describe('NotificationService', () => {
  let service: NotificationService;
  let userService: jest.Mocked<UserService>;
  let companyService: jest.Mocked<CompanyService>;
  let channelFactory: jest.Mocked<ChannelFactory>;
  let notificationFactory: jest.Mocked<NotificationFactory>;
  let uiNotificationRepository: jest.Mocked<UINotificationRepository>;
  let templateService: jest.Mocked<TemplateService>;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    companyId: 'company-1',
    subscribeChannels: [ChannelType.EMAIL, ChannelType.UI],
  };

  const mockCompany = {
    id: 'company-1',
    name: 'Test Company',
    subscribeChannels: [ChannelType.EMAIL, ChannelType.UI],
  };

  const mockNotification: AbstractNotification = {
    getType: () => NotificationType.HAPPY_BIRTHDAY,
    getDefaultChannels: () => [ChannelType.EMAIL, ChannelType.UI],
    getTemplateContext: () => ({
      firstName: mockUser.firstName,
      companyName: mockCompany.name,
    }),
  };

  const mockChannel: INotificationChannel = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  const mockTemplate = {
    subject: 'Happy Birthday {{firstName}}!',
    content: 'Happy birthday from {{companyName}}!',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CompanyService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ChannelFactory,
          useValue: {
            getChannel: jest.fn(),
          },
        },
        {
          provide: NotificationFactory,
          useValue: {
            getNotification: jest.fn(),
          },
        },
        {
          provide: UINotificationRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
        {
          provide: TemplateService,
          useValue: {
            seedDefaultTemplates: jest.fn(),
            getTemplate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userService = module.get(UserService);
    companyService = module.get(CompanyService);
    channelFactory = module.get(ChannelFactory);
    notificationFactory = module.get(NotificationFactory);
    uiNotificationRepository = module.get(UINotificationRepository);
    templateService = module.get(TemplateService);

    // Suppress console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    const sendNotificationDto: SendNotificationDto = {
      userId: 'user-1',
      companyId: 'company-1',
      type: NotificationType.HAPPY_BIRTHDAY,
    };

    beforeEach(() => {
      userService.findById.mockResolvedValue(mockUser);
      companyService.findById.mockResolvedValue(mockCompany);
      notificationFactory.getNotification.mockReturnValue(mockNotification);
      channelFactory.getChannel.mockReturnValue(mockChannel);
      templateService.getTemplate.mockResolvedValue(mockTemplate);
    });

    it('should send notification through subscribed channels', async () => {
      await service.sendNotification(sendNotificationDto);

      expect(userService.findById).toHaveBeenCalledWith('user-1');
      expect(companyService.findById).toHaveBeenCalledWith('company-1');
      expect(notificationFactory.getNotification).toHaveBeenCalledWith(
        NotificationType.HAPPY_BIRTHDAY,
      );
      expect(channelFactory.getChannel).toHaveBeenCalledWith(ChannelType.EMAIL);
      expect(channelFactory.getChannel).toHaveBeenCalledWith(ChannelType.UI);
      expect(mockChannel.send).toHaveBeenCalledTimes(2);
    });

    it('should not send notification if user is not subscribed to any channel', async () => {
      const unsubscribedUser = { ...mockUser, subscribeChannels: [] };
      userService.findById.mockResolvedValue(unsubscribedUser);

      await service.sendNotification(sendNotificationDto);

      expect(mockChannel.send).not.toHaveBeenCalled();
    });

    it('should not send notification if company is not subscribed to any channel', async () => {
      const unsubscribedCompany = { ...mockCompany, subscribeChannels: [] };
      companyService.findById.mockResolvedValue(unsubscribedCompany);

      await service.sendNotification(sendNotificationDto);

      expect(mockChannel.send).not.toHaveBeenCalled();
    });

    it('should filter channels based on user and company subscriptions', async () => {
      const partiallySubscribedUser = {
        ...mockUser,
        subscribeChannels: [ChannelType.EMAIL],
      };
      userService.findById.mockResolvedValue(partiallySubscribedUser);

      await service.sendNotification(sendNotificationDto);

      expect(channelFactory.getChannel).toHaveBeenCalledWith(ChannelType.EMAIL);
      expect(channelFactory.getChannel).not.toHaveBeenCalledWith(
        ChannelType.UI,
      );
      expect(mockChannel.send).toHaveBeenCalledTimes(1);
    });

    it('should skip channel if template is not found', async () => {
      templateService.getTemplate.mockResolvedValue(null);

      await service.sendNotification(sendNotificationDto);

      expect(mockChannel.send).not.toHaveBeenCalled();
    });

    it('should continue sending to other channels if one fails', async () => {
      const failingChannel = {
        send: jest.fn().mockRejectedValue(new Error('Channel failed')),
      };
      channelFactory.getChannel
        .mockReturnValueOnce(failingChannel)
        .mockReturnValueOnce(mockChannel);

      await service.sendNotification(sendNotificationDto);

      expect(failingChannel.send).toHaveBeenCalledTimes(1);
      expect(mockChannel.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUiNotifications', () => {
    it('should return UI notifications for a user', async () => {
      const mockNotifications = [
        { userId: 'user-1', content: 'Test notification', read: false },
      ];
      userService.findById.mockResolvedValue(mockUser);
      uiNotificationRepository.findByUserId.mockResolvedValue(
        mockNotifications as any,
      );

      const result = await service.getUiNotifications('user-1');

      expect(userService.findById).toHaveBeenCalledWith('user-1');
      expect(uiNotificationRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toEqual(mockNotifications);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userService.findById.mockRejectedValue(
        new NotFoundException('User with ID user-999 not found.'),
      );

      await expect(service.getUiNotifications('user-999')).rejects.toThrow(
        NotFoundException,
      );

      expect(userService.findById).toHaveBeenCalledWith('user-999');
      expect(uiNotificationRepository.findByUserId).not.toHaveBeenCalled();
    });
  });
});
