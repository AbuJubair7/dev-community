import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login and return a token and user details with masked password', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'correct-password',
      };
      
      const hashedPassword = bcrypt.hashSync(loginDto.password, 10);
      const mockUser = {
        _id: 'user-id-123',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mocked-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { id: mockUser._id, email: mockUser.email },
        expect.any(Object),
      );
      expect(result).toEqual({
        token: 'mocked-jwt-token',
        user: {
          _id: 'user-id-123',
          email: 'test@example.com',
          password: '****************', // The actual service masks the password
          name: 'Test User',
        },
      });
    });

    it('should throw UnauthorizedException if the user is not found', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if the password is incorrect', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const hashedPassword = bcrypt.hashSync('correct-password', 10);
      const mockUser = {
        _id: 'user-id-123',
        email: 'test@example.com',
        password: hashedPassword,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });
  });
});
