import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProfileUpdateRequestStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

const PROFILE_CHANGE_COOLDOWN_DAYS = 30;

@Injectable()
export class ProfileUpdateRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    role: "student" | "lecturer",
    requestedData: Record<string, unknown>,
  ) {
    const allowedKeys = [
      "fullName",
      "phone",
      "address",
      "gender",
      "birthDate",
      "citizenId",
    ];
    const filtered: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (requestedData[key] !== undefined && requestedData[key] !== null) {
        filtered[key] = requestedData[key];
      }
    }
    if (Object.keys(filtered).length === 0) {
      throw new BadRequestException(
        "At least one field must be provided in requestedData",
      );
    }

    const cooldownUntil = await this.getProfileChangeCooldownUntil(
      userId,
      role,
    );
    if (cooldownUntil) {
      throw new BadRequestException(
        `Profile changes are limited to once every ${PROFILE_CHANGE_COOLDOWN_DAYS} days. You can submit again after ${cooldownUntil.toISOString()}`,
      );
    }

    const request = await this.prisma.profileUpdateRequest.create({
      data: {
        userId,
        role,
        requestedData: filtered as object,
        status: "PENDING",
      },
    });

    const cooldownDate = new Date();
    if (role === "student") {
      await this.prisma.student.update({
        where: { id: userId },
        data: { lastProfileChangeAt: cooldownDate },
      });
    } else {
      await this.prisma.lecturer.update({
        where: { id: userId },
        data: { lastProfileChangeAt: cooldownDate },
      });
    }

    this.eventEmitter.emit("profile_update_request.created", {
      id: request.id,
      userId,
      role,
      requestedData: filtered,
    });

    return request;
  }

  async unlockProfileChangeCooldown(
    userId: string,
    role: "student" | "lecturer",
  ): Promise<{ ok: boolean }> {
    if (role === "student") {
      const student = await this.prisma.student.findUnique({
        where: { id: userId },
      });
      if (!student) throw new NotFoundException("Student not found");
      await this.prisma.student.update({
        where: { id: userId },
        data: { lastProfileChangeAt: null },
      });
    } else {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { id: userId },
      });
      if (!lecturer) throw new NotFoundException("Lecturer not found");
      await this.prisma.lecturer.update({
        where: { id: userId },
        data: { lastProfileChangeAt: null },
      });
    }
    return { ok: true };
  }

  async getProfileChangeCooldownUntil(
    userId: string,
    role: "student" | "lecturer",
  ): Promise<Date | null> {
    const user =
      role === "student"
        ? await this.prisma.student.findUnique({
            where: { id: userId },
            select: { lastProfileChangeAt: true },
          })
        : await this.prisma.lecturer.findUnique({
            where: { id: userId },
            select: { lastProfileChangeAt: true },
          });
    if (!user?.lastProfileChangeAt) return null;
    const until = new Date(user.lastProfileChangeAt);
    until.setDate(until.getDate() + PROFILE_CHANGE_COOLDOWN_DAYS);
    if (until <= new Date()) return null;
    return until;
  }

  async findAll(status?: ProfileUpdateRequestStatus) {
    const requests = await this.prisma.profileUpdateRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(
      requests.map(async (r) => {
        if (r.role === "student") {
          const student = await this.prisma.student.findUnique({
            where: { id: r.userId },
            select: {
              id: true,
              fullName: true,
              studentId: true,
              email: true,
              phone: true,
              address: true,
              gender: true,
              birthDate: true,
              citizenId: true,
            },
          });
          return { ...r, user: student };
        }
        const lecturer = await this.prisma.lecturer.findUnique({
          where: { id: r.userId },
          select: {
            id: true,
            fullName: true,
            lecturerId: true,
            email: true,
          },
        });
        return { ...r, user: lecturer };
      }),
    );

    return enriched;
  }

  async approve(id: string) {
    const req = await this.prisma.profileUpdateRequest.findUnique({
      where: { id },
    });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "PENDING")
      throw new BadRequestException("Request is not pending");

    const data = req.requestedData as Record<string, unknown>;

    const toStr = (x: unknown): string | undefined => {
      if (x == null || typeof x === "object") return undefined;
      if (typeof x === "string") return x;
      if (typeof x === "number" || typeof x === "boolean") return String(x);
      return undefined;
    };

    if (req.role === "student") {
      const studentUpdate: {
        fullName?: string;
        phone?: string;
        address?: string;
        gender?: boolean;
        birthDate?: string;
        citizenId?: string;
      } = {};
      const fullName = toStr(data.fullName);
      if (fullName !== undefined) studentUpdate.fullName = fullName;
      const phone = toStr(data.phone);
      if (phone !== undefined) studentUpdate.phone = phone;
      const address = toStr(data.address);
      if (address !== undefined) studentUpdate.address = address;
      if (data.gender !== undefined)
        studentUpdate.gender = data.gender === "male";
      const birthDate = toStr(data.birthDate);
      if (birthDate !== undefined) studentUpdate.birthDate = birthDate;
      const citizenId = toStr(data.citizenId);
      if (citizenId !== undefined) studentUpdate.citizenId = citizenId;

      await this.prisma.$transaction([
        this.prisma.student.update({
          where: { id: req.userId },
          data: studentUpdate,
        }),
        this.prisma.profileUpdateRequest.update({
          where: { id },
          data: { status: "APPROVED" },
        }),
      ]);
    } else {
      const lecturerUpdate: {
        fullName?: string;
        phone?: string;
        address?: string;
        gender?: boolean;
        birthDate?: string;
        citizenId?: string;
      } = {};
      const fullName = toStr(data.fullName);
      if (fullName !== undefined) lecturerUpdate.fullName = fullName;
      const phone = toStr(data.phone);
      if (phone !== undefined) lecturerUpdate.phone = phone;
      const address = toStr(data.address);
      if (address !== undefined) lecturerUpdate.address = address;
      if (data.gender !== undefined)
        lecturerUpdate.gender = data.gender === "male";
      const birthDate = toStr(data.birthDate);
      if (birthDate !== undefined) lecturerUpdate.birthDate = birthDate;
      const citizenId = toStr(data.citizenId);
      if (citizenId !== undefined) lecturerUpdate.citizenId = citizenId;

      await this.prisma.$transaction([
        this.prisma.lecturer.update({
          where: { id: req.userId },
          data: lecturerUpdate,
        }),
        this.prisma.profileUpdateRequest.update({
          where: { id },
          data: { status: "APPROVED" },
        }),
      ]);
    }

    const updated = await this.prisma.profileUpdateRequest.findUnique({
      where: { id },
    });

    this.eventEmitter.emit("profile_update_request.approved", {
      userId: req.userId,
      role: req.role,
    });

    return updated;
  }

  async reject(id: string, reason?: string) {
    const req = await this.prisma.profileUpdateRequest.findUnique({
      where: { id },
    });
    if (!req) throw new NotFoundException("Request not found");
    if (req.status !== "PENDING")
      throw new BadRequestException("Request is not pending");

    const updated = await this.prisma.profileUpdateRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        ...(reason ? ({ rejectionReason: reason.trim() } as any) : {}),
      },
    });

    this.eventEmitter.emit("profile_update_request.rejected", {
      userId: req.userId,
      role: req.role,
    });

    return updated;
  }
}
