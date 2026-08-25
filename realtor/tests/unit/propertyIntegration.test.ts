import https from 'https';
import EventEmitter from 'events';
import { resolvers } from '../../src/schema/resolvers';
import { User } from '../../src/models/User';
import { PropertyData } from '../../src/models/PropertyData';
import { Areas } from '../../src/models/Areas';
import { RealEstateProviderFactory, RapidApiRealEstateProvider, DEFAULT_SAMPLE_PROPERTIES } from '../../src/services/RealEstateProvider';

describe('Property API Integration Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(PropertyData, 'findOne').mockResolvedValue(null);
    jest.spyOn(PropertyData, 'findOneAndUpdate').mockResolvedValue(null as any);
    jest.spyOn(Areas, 'find').mockResolvedValue([]);
    jest.spyOn(Areas, 'findOne').mockResolvedValue(null);
    jest.spyOn(Areas, 'deleteOne').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('PropertyData Model & RealEstateProvider', () => {
    it('should return instance from RealEstateProviderFactory', () => {
      const provider = RealEstateProviderFactory.getProvider();
      expect(provider).toBeInstanceOf(RapidApiRealEstateProvider);
    });

    it('should return cached properties from PropertyData if present', async () => {
      const mockSample = {
        id: 'sample-data-1',
        properties: DEFAULT_SAMPLE_PROPERTIES.map((p) => ({
          ...p,
          toObject: () => p,
        })),
      };
      jest.spyOn(PropertyData, 'findOne').mockResolvedValue(mockSample as any);

      const provider = new RapidApiRealEstateProvider();
      const results = await provider.searchPolygon([{ lat: 43.65, lng: -79.38 }]);
      expect(results).toHaveLength(DEFAULT_SAMPLE_PROPERTIES.length);
    });

    it('should fallback to DEFAULT_SAMPLE_PROPERTIES if PropertyData is empty and no API key', async () => {
      jest.spyOn(PropertyData, 'findOne').mockResolvedValue(null);
      const provider = new RapidApiRealEstateProvider();
      const results = await provider.searchPolygon([{ lat: 43.65, lng: -79.38 }]);
      expect(results).toHaveLength(DEFAULT_SAMPLE_PROPERTIES.length);
      expect(PropertyData.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should fetch from RapidAPI when apiKey is provided and parse complete response', async () => {
      process.env.RAPIDAPI_KEY = 'test-key-123';
      process.env.RAPIDAPI_HOST = 'real-time-real-estate-data.p.rapidapi.com';

      const mockApiResponse = {
        status: 'OK',
        data: {
          props: [
            {
              zpid: 'rapid-prop-1',
              price: 990000,
              currency: 'CAD',
              address: { streetAddress: '100 Yonge St', city: 'Toronto', state: 'ON', zipcode: 'M5C 2W1', country: 'CA' },
              location: { latitude: 43.65, longitude: -79.38 },
              bedrooms: 2,
              bathrooms: 2,
              livingArea: 900,
              homeType: 'CONDO',
              homeStatus: 'FOR_SALE',
              imgSrc: 'https://img.com/1.jpg',
              detailUrl: 'https://detail.com/1',
              daysOnZillow: 10,
              zestimate: 1000000,
              rentZestimate: 3500,
            },
          ],
        },
      };

      const mockReq = new EventEmitter() as any;
      mockReq.setTimeout = jest.fn();
      mockReq.destroy = jest.fn();

      jest.spyOn(https, 'get').mockImplementation((url: any, opts: any, cb: any) => {
        const res = new EventEmitter() as any;
        res.statusCode = 200;
        if (cb) cb(res);
        res.emit('data', JSON.stringify(mockApiResponse));
        res.emit('end');
        return mockReq;
      });

      const provider = new RapidApiRealEstateProvider();
      const results = await provider.searchPolygon([{ lat: 43.65, lng: -79.38 }]);
      expect(results).toHaveLength(1);
      expect(results[0].zpid).toBe('rapid-prop-1');
      expect(results[0].daysOnZillow).toBe(10);
    });

    it('should map minimal RapidAPI prop response with fallback defaults', async () => {
      process.env.RAPIDAPI_KEY = 'test-key-123';

      const mockApiResponse = {
        status: 'OK',
        data: {
          props: [
            {
              property_id: 'prop-minimal',
              // missing price, address, location, bedrooms, bathrooms, livingArea, etc.
            },
          ],
        },
      };

      const mockReq = new EventEmitter() as any;
      mockReq.setTimeout = jest.fn();
      mockReq.destroy = jest.fn();

      jest.spyOn(https, 'get').mockImplementation((url: any, opts: any, cb: any) => {
        const res = new EventEmitter() as any;
        res.statusCode = 200;
        if (cb) cb(res);
        res.emit('data', JSON.stringify(mockApiResponse));
        res.emit('end');
        return mockReq;
      });

      const provider = new RapidApiRealEstateProvider();
      const results = await provider.searchPolygon([{ lat: 43.65, lng: -79.38 }]);
      expect(results).toHaveLength(1);
      expect(results[0].zpid).toBe('prop-minimal');
      expect(results[0].price).toBe(500000);
      expect(results[0].bedrooms).toBeUndefined();
    });

    it('should fallback to DEFAULT_SAMPLE_PROPERTIES on JSON parse error or request timeout', async () => {
      process.env.RAPIDAPI_KEY = 'test-key-123';
      process.env.RAPIDAPI_HOST = 'real-time-real-estate-data.p.rapidapi.com';

      const mockReq = new EventEmitter() as any;
      mockReq.setTimeout = jest.fn((ms, cb) => cb && cb());
      mockReq.destroy = jest.fn();

      jest.spyOn(https, 'get').mockImplementation((url: any, opts: any, cb: any) => {
        const res = new EventEmitter() as any;
        res.statusCode = 200;
        if (cb) cb(res);
        res.emit('data', 'INVALID_JSON{{{');
        res.emit('end');
        return mockReq;
      });

      const provider = new RapidApiRealEstateProvider();
      const results = await provider.searchPolygon([{ lat: 43.65, lng: -79.38 }]);
      expect(results).toEqual(DEFAULT_SAMPLE_PROPERTIES);
    });

    it('should handle request network error gracefully', async () => {
      process.env.RAPIDAPI_KEY = 'test-key-123';

      const mockReq = new EventEmitter() as any;
      mockReq.setTimeout = jest.fn();
      mockReq.destroy = jest.fn();

      jest.spyOn(https, 'get').mockImplementation((url: any, opts: any, cb: any) => {
        process.nextTick(() => mockReq.emit('error', new Error('Network error')));
        return mockReq;
      });

      const provider = new RapidApiRealEstateProvider();
      const results = await provider.searchPolygon([{ lat: 43.65, lng: -79.38 }]);
      expect(results).toEqual(DEFAULT_SAMPLE_PROPERTIES);
    });

    it('should create PropertyData document with default values', () => {
      const sample = new PropertyData({ id: 'sample-test', properties: [] });
      expect(sample.id).toBe('sample-test');
      expect(sample.properties).toEqual([]);
    });
  });

  describe('Areas Model & Polygon Persistence', () => {
    it('should create an Areas document with userId, polygon, properties, and candidateProperties', () => {
      const area = new Areas({
        id: 'area-unit-1',
        userId: 'user@realtor.com',
        name: 'Financial District',
        polygon: [{ lat: 43.65, lng: -79.38 }],
        properties: [],
        candidateProperties: [],
      });

      expect(area.id).toBe('area-unit-1');
      expect(area.userId).toBe('user@realtor.com');
      expect(area.name).toBe('Financial District');
      expect(area.polygon).toHaveLength(1);
    });

    it('should persist new area via saveUserArea mutation and return formatted area', async () => {
      jest.spyOn(Areas.prototype, 'save').mockResolvedValue({
        id: 'area-db-123',
        userId: 'user@realtor.com',
        name: 'Yorkville Polygon',
        polygon: [{ lat: 43.67, lng: -79.39 }],
        properties: [],
        candidateProperties: [],
      } as any);

      const savedArea = await resolvers.Mutation.saveUserArea(
        null,
        { name: 'Yorkville Polygon', polygon: [{ lat: 43.67, lng: -79.39 }] },
        { token: 'mock-token-user-123' }
      );

      expect(savedArea.name).toBe('Yorkville Polygon');
      expect(savedArea.polygon).toEqual([{ lat: 43.67, lng: -79.39 }]);
    });

    it('should delete area from Areas collection via deleteUserArea mutation', async () => {
      const result = await resolvers.Mutation.deleteUserArea(
        null,
        { id: 'area-db-123' },
        { token: 'mock-token-user-123' }
      );

      expect(result).toBe(true);
      expect(Areas.deleteOne).toHaveBeenCalledWith({ id: 'area-db-123', userId: 'user@realtor.com' });
    });
  });

  describe('Mutation.executeAreaSearch & Saved Areas', () => {
    it('should execute area search and attach properties to Areas document', async () => {
      const mockAreaDoc = {
        id: 'area-db-target',
        userId: 'user@realtor.com',
        name: 'Database Area',
        polygon: [{ lat: 43.64, lng: -79.38 }, { lat: 43.65, lng: -79.39 }, { lat: 43.66, lng: -79.37 }],
        properties: [],
        candidateProperties: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Areas, 'findOne').mockResolvedValue(mockAreaDoc as any);

      const res = await resolvers.Mutation.executeAreaSearch(
        null,
        { areaId: 'area-db-target' },
        { token: 'mock-token-user-123' }
      );

      expect(mockAreaDoc.save).toHaveBeenCalled();
      expect(res.properties?.length).toBeGreaterThan(0);
    });
  });

  describe('Mutation.transferPropertyToCandidate', () => {
    it('should transfer property to candidateProperties on Areas document', async () => {
      const mockAreaDoc = {
        id: 'area-cand-target',
        userId: 'user@realtor.com',
        name: 'Candidate Test Area',
        polygon: [{ lat: 43.65, lng: -79.38 }],
        properties: [...DEFAULT_SAMPLE_PROPERTIES],
        candidateProperties: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Areas, 'findOne').mockResolvedValue(mockAreaDoc as any);

      const res = await resolvers.Mutation.transferPropertyToCandidate(
        null,
        { areaId: 'area-cand-target', zpid: DEFAULT_SAMPLE_PROPERTIES[0].zpid },
        { token: 'mock-token-user-123' }
      );

      expect(mockAreaDoc.save).toHaveBeenCalled();
      expect(res.candidateProperties?.length).toBe(1);
    });
  });
});
