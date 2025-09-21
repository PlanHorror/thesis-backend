import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { StudentService } from 'src/user-manager/student/student.service';
import { TeacherService } from 'src/user-manager/teacher/teacher.service';
import { AdminRegisterDto, SigninDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AccountPayload } from 'common/interface/account.interface';
import { Role } from 'common';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly studentService: StudentService,
    private readonly teacherService: TeacherService,
  ) {}

  generateToken(payload: AccountPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'defaultSecret', {
      expiresIn: '1Y',
    });
  }

  async adminSignup(data: AdminRegisterDto) {
    const { password, confirmPassword, ...rest } = data;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return this.adminService.create({ ...rest, password: hashedPassword });
  }

  async adminSignin(data: SigninDto): Promise<{ token: string }> {
    try {
      const admin = await this.adminService.findByUsername(data.username);
      if (!(await bcrypt.compare(data.password, admin.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!admin.active) {
        throw new UnauthorizedException('Account is inactive');
      }
      const token = this.generateToken({
        id: admin.id,
        role: Role.ADMIN,
      });
      return { token };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async studentSignin(data: SigninDto): Promise<{ token: string }> {
    try {
      const student = await this.studentService.findByUsername(data.username);
      if (!(await bcrypt.compare(data.password, student.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!student.active) {
        throw new UnauthorizedException('Account is inactive');
      }
      const token = this.generateToken({
        id: student.id,
        role: Role.STUDENT,
        email: student.email,
      });
      return { token };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async teacherSignin(data: SigninDto) {
    try {
      const teacher = await this.teacherService.findByUsername(data.username);
      if (!(await bcrypt.compare(data.password, teacher.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!teacher.active) {
        throw new UnauthorizedException('Account is inactive');
      }
      const token = this.generateToken({
        id: teacher.id,
        role: Role.TEACHER,
        email: teacher.email,
      });
      return { token };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
