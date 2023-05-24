import { SignInDto } from './signin.dto';

describe('Signin', () => {
  it('should be defined', () => {
    expect(new SignInDto()).toBeDefined();
  });
});
