import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@/auth/decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { BaseResponseDto } from '@/common/dto/base-response.dto';
import { JwtGuard } from '@/auth/guard';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Get('profile-risk/predict')
  @HttpCode(HttpStatus.OK)
  async predictProfileRisk(@User('user_id') userId: string) {
    const user = await this.userService.predictProfileRisk(userId);

    if (!user) {
      return BaseResponseDto.error('User not found in core banking', null);
    }

    const payload = {
      Age: user.age,
      Occupation: user.occupation || 'Other',
      Annual_Income: Number(user.annual_income),
      Monthly_Inhand_Salary: Number(user.monthly_inhand_salary),
      Num_Bank_Accounts: user.num_bank_accounts,
      Num_Credit_Card: user.num_credit_cards,
      Interest_Rate: user.interest_rate,
      Num_of_Loan: user.num_of_loans,
      Type_of_Loan: user.type_of_loans,
      Delay_from_due_date: user.delay_from_due_date,
      Num_of_Delayed_Payment: user.num_of_delayed_payments,
      Changed_Credit_Limit: user.changed_credit_limit,
      Num_Credit_Inquiries: user.num_credit_inquiries,
      Credit_Mix: user.credit_mix,
      Outstanding_Debt: user.outstanding_debt,
      Credit_History_Age: user.credit_history_age,
      Payment_of_Min_Amount: user.payment_of_minimum_amount,
      Total_EMI_per_month: Number(user.total_emi_per_month),
      Payment_Behaviour: user.payment_behaviour,
      Monthly_Balance: Number(user.monthly_balance),
    };

    try {
      const fastApiUrl = this.configService.get('FASTAPI_URL');
      const response = await firstValueFrom(
        this.httpService.post(
          `${fastApiUrl}/api/predict/profile-risk`,
          payload,
        ),
      );

      const predictionResult = response.data;

      if (!predictionResult || !predictionResult.prediction) {
        throw new Error('Invalid response from ML API');
      }

      // Update the user with the prediction result
      const user = await this.userService.updateProfileRisk(
        userId,
        predictionResult.prediction,
      );

      return BaseResponseDto.success(
        'Profile risk prediction successful',
        user,
      );
    } catch (error) {
      console.error('Error calling ML API:', error.message);
      return BaseResponseDto.error(
        'Error calling ML API: ' + error.message,
        null,
      );
    }
  }

  @Get('profile-risk/types')
  @HttpCode(HttpStatus.OK)
  async getProfileRiskTypes() {
    try {
      const profileRisks = await this.userService.getProfileRiskTypes();

      if (!profileRisks || profileRisks.length === 0) {
        return BaseResponseDto.error('No profile risk types found', []);
      }

      return BaseResponseDto.success(
        'Profile risk types retrieved successfully',
        profileRisks,
      );
    } catch (error) {
      console.error('Error retrieving profile risk types:', error.message);
      return BaseResponseDto.error(
        'Error retrieving profile risk types: ' + error.message,
        null,
      );
    }
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@User('user_id') userId: string) {
    const user = await this.userService.getProfile(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new BaseResponseDto(
      true,
      'Successfully retrieved user profile',
      user,
    );
  }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
