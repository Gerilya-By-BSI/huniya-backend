import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) { }

  async predictProfileRisk(userId: string) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const coreBankingProfile =
      await this.prismaService.coreBankingUser.findFirst({
        where: {
          phone_number: user.phone_number,
        },
      });

    // console.log('coreBankingProfile', coreBankingProfile);

    return coreBankingProfile;
  }

  async getProfile(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone_number: true,
        email: true,
        created_at: true,
        updated_at: true,
        profile_risk: {
          select: {
            id: true,
            name: true,
          },
        },
        document: {
          select: {
            ktp_url: true,
            npwp_url: true,
            payslip_url: true,
          },
        },
      },
    });
  }
  

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
