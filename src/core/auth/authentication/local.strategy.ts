import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ProfileService } from '../../profile/profile.service';
import { HashService } from './hash.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private logger: Logger = new Logger(LocalStrategy.name);
  constructor(
    private profileService: ProfileService,
    private hashService: HashService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await this.profileService.findOneByEmail(email);
      const comparePassword = await this.hashService.comparePassword(
        password,
        user.hashedPassword,
      );
      if (comparePassword) {
        const { email, id } = user;
        return {
          email,
          id,
        };
      }
      throw new UnauthorizedException();
    } catch (error) {
      this.logger.warn(error);
      throw new UnauthorizedException();
    }
  }
}
