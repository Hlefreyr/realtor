import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/db';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Database Configuration Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call mongoose.connect with provided URI', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);

    const uri = 'mongodb://testuser:testpass@localhost:27017/realtor_test';
    const conn = await connectDB(uri);

    expect(mongoose.connect).toHaveBeenCalledWith(uri);
    expect(conn).toBe(mongoose);
  });

  it('should fallback to default URI when no argument or env is provided', async () => {
    const originalUri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);

    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/realtor');

    process.env.MONGO_URI = originalUri;
  });

  it('should throw an error if mongoose.connect fails', async () => {
    const error = new Error('Connection refused');
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

    await expect(connectDB()).rejects.toThrow('Connection refused');
  });

  it('should call mongoose.disconnect on disconnectDB', async () => {
    (mongoose.disconnect as jest.Mock).mockResolvedValueOnce(undefined);

    await disconnectDB();
    expect(mongoose.disconnect).toHaveBeenCalled();
  });

  it('should throw an error if mongoose.disconnect fails', async () => {
    const error = new Error('Disconnection error');
    (mongoose.disconnect as jest.Mock).mockRejectedValueOnce(error);

    await expect(disconnectDB()).rejects.toThrow('Disconnection error');
  });
});
