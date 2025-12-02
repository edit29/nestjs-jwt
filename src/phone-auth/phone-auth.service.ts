import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomInt } from 'crypto';

@Injectable()
export class PhoneAuthService {
  private readonly logger = new Logger(PhoneAuthService.name);
  constructor(private readonly prisma: PrismaService) {}

  // Generate and store a verification code for a phone number
  async sendCode(phone: string, payload?: { email?: string; name?: string; password?: string }) {
    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store optional registration payload (password should already be hashed by caller)
    await this.prisma.phoneVerification.create({
      data: {
        phone,
        code,
        expiresAt,
        email: payload?.email,
        name: payload?.name,
        password: payload?.password,
      },
    });

    // TODO: integrate with SMS provider (Twilio) to send the code; for now just log
    this.logger.log(`Verification code for ${phone}: ${code}`);
    return { success: true };
  }

  // Verify code, return the associated user id (creating user if needed)
  async verifyCode(phone: string, code: string) {
    const record = await this.prisma.phoneVerification.findFirst({ where: { phone, code }, orderBy: { createdAt: 'desc' } });
    if (!record) return null;
    if (record.expiresAt < new Date()) return null;

    // Remove used codes
    await this.prisma.phoneVerification.deleteMany({ where: { phone } });

    // If a user with this phone already exists, mark verified and return
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (user) {
      await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
      user = await this.prisma.user.findUnique({ where: { id: user.id } });
      return user;
    }

    // If the verification record contains registration payload, create user with that data
    if (record.email || record.password) {
      const createData: any = {
        phone,
        phoneVerified: true,
        name: record.name ?? record.email ?? phone,
      };
      if (record.email) createData.email = record.email;
      if (record.password) createData.password = record.password; // already hashed by caller

      user = await this.prisma.user.create({ data: createData });
      return user;
    }

    // Fallback: create a simple user with phone as name
    user = await this.prisma.user.create({ data: { phone, name: phone, phoneVerified: true } });
    return user;
  }
}
