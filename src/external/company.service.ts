import { Injectable, NotFoundException } from '@nestjs/common';
import { Company } from 'src/common/types/user.types';
import { ChannelType } from 'src/common/types/channel-type.enum';

@Injectable()
export class CompanyService {
  private readonly companies: Company[] = [
    {
      id: 'company-a',
      name: 'Company A',
      subscribeChannels: [ChannelType.EMAIL, ChannelType.UI],
    },
    {
      id: 'company-b',
      name: 'Company B',
      subscribeChannels: [ChannelType.UI],
    },
  ];

  async findById(id: string): Promise<Company> {
    const company = this.companies.find((c) => c.id === id);
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found.`);
    }
    return company;
  }
}
