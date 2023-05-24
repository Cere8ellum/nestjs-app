import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity/users.entity';
import { CreateUserDto } from 'src/dtos/user/create-user/create-user.dto';
import { Role } from '../auth/roles/roles.enum';
import { hash } from '../../utils/crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(user: CreateUserDto) {
    // Checking for the existence of an email
    const foundByEmail = await this.findByEmail(user.email);

    if (foundByEmail) {
      throw new BadRequestException(
        `Пользователь с email ${user.email} уже зарегистрирован`,
        {
          description: 'Email существует',
        },
      );
    }

    // Checking for the existence of a nickname
    const foundByNickname = await this.findByNickname(user.nickname);

    if (foundByNickname) {
      throw new BadRequestException(
        `Пользователь с ником ${user.nickname} уже зарегистрирован`,
        {
          description: 'Имя пользователя существует',
        },
      );
    }

    const userEntity = new UsersEntity();
    userEntity.nickname = user.nickname.toLowerCase();
    userEntity.email = user.email.toLowerCase();
    userEntity.role = Role.User;
    userEntity.password = await hash(user.password);

    return await this.usersRepository.save(userEntity);
  }

  async update(user: CreateUserDto, userId: number) {
    // Checking for the existence of an email
    const foundByEmail = await this.findByEmail(user.email);

    // If id of found user by email is not equal to id of current user
    if (foundByEmail && foundByEmail.id !== userId) {
      throw new BadRequestException(
        `Пользователь с email ${user.email} уже зарегистрирован`,
        {
          description: 'Email существует',
        },
      );
    }

    // Checking for the existence of a nickname
    const foundByNickname = await this.findByNickname(user.nickname);
    // If id of found user by nickname is not equal to id of current user
    if (foundByNickname && foundByNickname.id !== userId) {
      throw new BadRequestException(
        `Пользователь с ником ${user.nickname} уже зарегистрирован`,
        {
          description: 'Имя пользователя существует',
        },
      );
    }

    const userEntity = new UsersEntity();
    userEntity.nickname = user.nickname;
    userEntity.email = user.email;
    userEntity.password = await hash(user.password);

    return await this.usersRepository.update(userId, userEntity);
  }

  async findById(id: number): Promise<UsersEntity> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByNickname(nickname: string): Promise<UsersEntity> {
    const tlc = nickname.toLowerCase();
    return await this.usersRepository.findOne({ where: { nickname: tlc } });
  }

  async findByEmail(email: string): Promise<UsersEntity> {
    const tlc = email.toLowerCase();
    return await this.usersRepository.findOne({ where: { email: tlc } });
  }
}
