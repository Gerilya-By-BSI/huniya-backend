import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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

    return coreBankingProfile;
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

  async updateProfileRisk(userId: string, predictionResult: string) {
    const profileRisk = await this.prismaService.profileRisk.findFirstOrThrow({
      where: {
        name: predictionResult,
      },
    });

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        profile_risk_id: profileRisk.id,
      },
    });

    return this.prismaService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        profile_risk_id: true,
        profile_risk: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
