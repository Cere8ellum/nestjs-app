import { CreateUserDto } from './create-user.dto';

describe('UserCreateDto', () => {
  it('should be defined', () => {
    expect(new CreateUserDto()).toBeDefined();
  });
});
