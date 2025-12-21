import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

/**
 * User Repository - Data access layer for User entity
 * Handles all database operations for users
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        name: data.name,
      },
    });
  }

  /**
   * Update user profile
   */
  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'avatar' | 'password'>>,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Get all users (for task assignment dropdown)
   */
  async findAll(): Promise<Pick<User, 'id' | 'email' | 'name' | 'avatar'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
