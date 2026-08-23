import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, hashUserPassword } from '../../src/models/User';
import { seedUsers } from '../../src/seed';
import { resolvers } from '../../src/schema/resolvers';

describe('Authentication & User Model Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
  });

  describe('User Model & Password Hashing', () => {
    it('should create a User document with default role user', () => {
      const user = new User({
        email: 'test@realtor.com',
        password: 'password123',
      });
      expect(user.email).toBe('test@realtor.com');
      expect(user.role).toBe('user');
      expect(user.settings.unit).toBe('kilometers');
      expect(user.settings.radius).toBe(50);
      expect(user.savedAreas).toEqual([]);
    });

    it('should reuse mongoose.models.User if already registered', () => {
      expect(mongoose.models.User).toBeDefined();
      expect(User).toBe(mongoose.models.User);
    });

    it('should create new model if mongoose.models.User is undefined', () => {
      const original = mongoose.models.User;
      delete mongoose.models.User;
      const FreshUser = mongoose.models.User || mongoose.model('User', User.schema);
      expect(FreshUser).toBeDefined();
      mongoose.models.User = original;
    });

    it('should hash password via hashUserPassword if modified', async () => {
      const user = new User({
        email: 'hash@realtor.com',
        password: 'rawpassword',
      });

      await hashUserPassword(user);

      expect(user.password).not.toBe('rawpassword');
      expect(await user.comparePassword('rawpassword')).toBe(true);
      expect(await user.comparePassword('wrongpassword')).toBe(false);
    });

    it('should skip password hashing if password is not modified', async () => {
      const user = new User({
        email: 'unmodified@realtor.com',
        password: '$2a$10$alreadyhashed',
      });

      jest.spyOn(user, 'isModified').mockReturnValue(false);

      await hashUserPassword(user);

      expect(user.password).toBe('$2a$10$alreadyhashed');
    });
  });

  describe('seedUsers', () => {
    it('should create admin and user accounts if they do not exist', async () => {
      jest.spyOn(User, 'findOne')
        .mockResolvedValueOnce(null) // admin
        .mockResolvedValueOnce(null); // user

      jest.spyOn(User, 'create').mockImplementation((data: any) => Promise.resolve({ ...data, _id: 'mockid' }) as any);

      await seedUsers();

      expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@realtor.com' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@realtor.com' });
      expect(User.create).toHaveBeenCalledWith({
        email: 'admin@realtor.com',
        password: 'admin',
        role: 'admin',
      });
      expect(User.create).toHaveBeenCalledWith({
        email: 'user@realtor.com',
        password: 'user',
        role: 'user',
      });
    });

    it('should skip creating accounts if admin and user already exist', async () => {
      jest.spyOn(User, 'findOne')
        .mockResolvedValueOnce({ email: 'admin@realtor.com' } as any)
        .mockResolvedValueOnce({ email: 'user@realtor.com' } as any);

      const createSpy = jest.spyOn(User, 'create');

      await seedUsers();

      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should throw if User.findOne fails', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB Error'));
      await expect(seedUsers()).rejects.toThrow('DB Error');
    });
  });

  describe('resolvers.Query.me', () => {
    it('should return context user if present', async () => {
      const mockUser = { id: '1', email: 'test@realtor.com', role: 'user', settings: { unit: 'kilometers', radius: 50 }, savedAreas: [] };
      const res = await resolvers.Query.me(null, null, { user: mockUser });
      expect(res).toEqual(mockUser);
    });

    it('should return default fallback user if no context user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const res = await resolvers.Query.me(null, null, {});
      expect(res.role).toBe('user');
    });
  });

  describe('resolvers.Mutation.login', () => {
    it('should authenticate user and return token + user info', async () => {
      const mockCompare = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: 'user123',
        email: 'user@realtor.com',
        role: 'user',
        settings: { unit: 'kilometers', radius: 50 },
        savedAreas: [],
        comparePassword: mockCompare,
      };

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser as any);

      const result = await resolvers.Mutation.login(null, {
        email: 'USER@realtor.com ',
        password: 'user',
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@realtor.com' });
      expect(mockCompare).toHaveBeenCalledWith('user');
      expect(result.user).toEqual({
        id: 'user123',
        email: 'user@realtor.com',
        role: 'user',
        settings: { unit: 'kilometers', radius: 50 },
        savedAreas: [],
      });
      expect(result.token).toContain('mock-token-user123-user-');
    });

    it('should throw UNAUTHENTICATED error if user email is not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

      await expect(
        resolvers.Mutation.login(null, {
          email: 'unknown@realtor.com',
          password: 'pwd',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw UNAUTHENTICATED error if password does not match', async () => {
      const mockCompare = jest.fn().mockResolvedValue(false);
      const mockUser = {
        _id: 'user123',
        email: 'user@realtor.com',
        role: 'user',
        comparePassword: mockCompare,
      };

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser as any);

      await expect(
        resolvers.Mutation.login(null, {
          email: 'user@realtor.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
