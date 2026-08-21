import { User } from './models/User';

export const seedUsers = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ email: 'admin@realtor.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@realtor.com',
        password: 'admin',
        role: 'admin',
      });
      console.log('Seeded admin user: admin@realtor.com');
    }

    const userExists = await User.findOne({ email: 'user@realtor.com' });
    if (!userExists) {
      await User.create({
        email: 'user@realtor.com',
        password: 'user',
        role: 'user',
      });
      console.log('Seeded standard user: user@realtor.com');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};
