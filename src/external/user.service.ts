import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/common/types/user.types';
import { ChannelType } from 'src/common/types/channel-type.enum';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@companyA.com',
      companyId: 'company-a',
      subscribeChannels: [ChannelType.EMAIL],
      leaveBalance: 25,
      dateOfBirth: new Date('1990-03-15'),
      salary: 5000,
    },
    {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@companyA.com',
      companyId: 'company-a',
      subscribeChannels: [ChannelType.UI],
      leaveBalance: 12,
      dateOfBirth: new Date('1985-07-22'),
      salary: 6000,
    },
    {
      id: 'user-3',
      firstName: 'Peter',
      lastName: 'Jones',
      email: 'peter.jones@companyB.com',
      companyId: 'company-b',
      subscribeChannels: [],
      leaveBalance: 30,
      dateOfBirth: new Date('1988-11-08'),
      salary: 7000,
    },
    {
      id: 'user-4',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@companyA.com',
      companyId: 'company-a',
      subscribeChannels: [ChannelType.EMAIL, ChannelType.UI],
      leaveBalance: 8,
      dateOfBirth: new Date('1992-09-12'),
      salary: 8000,
    },
    {
      id: 'user-5',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@companyB.com',
      companyId: 'company-b',
      subscribeChannels: [ChannelType.UI],
      leaveBalance: 20,
      dateOfBirth: new Date('1987-01-30'),
      salary: 9000,
    },
  ];

  async findById(id: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }
}
