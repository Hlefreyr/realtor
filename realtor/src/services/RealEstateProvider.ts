import https from 'https';
import { IPoint, ISearchCriteria } from '../models/User';
import { PropertyData, IPropertyListing } from '../models/PropertyData';

export interface IRealEstateProvider {
  searchPolygon(polygon: IPoint[], criteria?: ISearchCriteria): Promise<IPropertyListing[]>;
  searchByAddress(address: string): Promise<any>;
}

export const DEFAULT_SAMPLE_PROPERTIES: IPropertyListing[] = [
  {
    zpid: 'sample-prop-101',
    property_id: 'CA_ON_TOR_101',
    price: 849000,
    currency: 'CAD',
    address: {
      streetAddress: '120 Adelaide St W Unit 1502',
      city: 'Toronto',
      state: 'ON',
      zipcode: 'M5H 1T1',
      country: 'CA',
    },
    location: {
      latitude: 43.6492,
      longitude: -79.3838,
    },
    bedrooms: 2,
    bathrooms: 2,
    livingArea: 880,
    homeType: 'CONDO',
    homeStatus: 'FOR_SALE',
    imgSrc: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    detailUrl: 'https://www.realtor.ca/real-estate/sample-101',
    daysOnZillow: 5,
    zestimate: 860000,
    rentZestimate: 3200,
  },
  {
    zpid: 'sample-prop-102',
    property_id: 'CA_ON_TOR_102',
    price: 1250000,
    currency: 'CAD',
    address: {
      streetAddress: '88 Harbour St Unit 2204',
      city: 'Toronto',
      state: 'ON',
      zipcode: 'M5J 0B7',
      country: 'CA',
    },
    location: {
      latitude: 43.6421,
      longitude: -79.3809,
    },
    bedrooms: 3,
    bathrooms: 2.5,
    livingArea: 1240,
    homeType: 'CONDO',
    homeStatus: 'FOR_SALE',
    imgSrc: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    detailUrl: 'https://www.realtor.ca/real-estate/sample-102',
    daysOnZillow: 12,
    zestimate: 1275000,
    rentZestimate: 4500,
  },
  {
    zpid: 'sample-prop-103',
    property_id: 'CA_ON_TOR_103',
    price: 1680000,
    currency: 'CAD',
    address: {
      streetAddress: '240 Richmond St W',
      city: 'Toronto',
      state: 'ON',
      zipcode: 'M5V 1V6',
      country: 'CA',
    },
    location: {
      latitude: 43.6498,
      longitude: -79.3892,
    },
    bedrooms: 4,
    bathrooms: 3,
    livingArea: 2150,
    homeType: 'TOWNHOUSE',
    homeStatus: 'FOR_SALE',
    imgSrc: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    detailUrl: 'https://www.realtor.ca/real-estate/sample-103',
    daysOnZillow: 2,
    zestimate: 1710000,
    rentZestimate: 5800,
  },
  {
    zpid: 'sample-prop-104',
    property_id: 'CA_ON_TOR_104',
    price: 699000,
    currency: 'CAD',
    address: {
      streetAddress: '300 Front St W Unit 812',
      city: 'Toronto',
      state: 'ON',
      zipcode: 'M5V 0E9',
      country: 'CA',
    },
    location: {
      latitude: 43.6448,
      longitude: -79.3895,
    },
    bedrooms: 1,
    bathrooms: 1,
    livingArea: 620,
    homeType: 'CONDO',
    homeStatus: 'FOR_SALE',
    imgSrc: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    detailUrl: 'https://www.realtor.ca/real-estate/sample-104',
    daysOnZillow: 18,
    zestimate: 710000,
    rentZestimate: 2600,
  },
];

export class RapidApiRealEstateProvider implements IRealEstateProvider {
  private apiKey: string;
  private apiHost: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.apiHost = process.env.RAPIDAPI_HOST || 'real-time-real-estate-data.p.rapidapi.com';
  }

  private fetchJson(url: string, headers: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.get(url, { headers }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', (err) => reject(err));
      req.setTimeout(8000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  public async searchPolygon(
    polygon: IPoint[],
    criteria?: ISearchCriteria
  ): Promise<IPropertyListing[]> {
    // Check Mongo PropertyData to preserve 100 calls/month budget
    try {
      const existingSample = await PropertyData.findOne({ id: 'sample-data-1' });
      if (existingSample && existingSample.properties && existingSample.properties.length > 0) {
        return existingSample.properties.map((p: any) => (p.toObject ? p.toObject() : p));
      }
    } catch (err) {
      // Mongo offline or error, proceed to fallback
    }

    const polygonStr =
      polygon && polygon.length >= 3
        ? polygon.map((pt) => `${pt.lng},${pt.lat}`).join(',')
        : '-79.3900,43.6450,-79.3750,43.6550,-79.3700,43.6400';

    let propertiesToSave: IPropertyListing[] = DEFAULT_SAMPLE_PROPERTIES;

    if (this.apiKey) {
      try {
        const queryParams = new URLSearchParams({
          polygon: polygonStr,
          status_type: criteria?.statusType || 'ForSale',
          home_type: (criteria?.homeTypes || ['Houses', 'Condos']).join(','),
          price_min: String(criteria?.priceMin ?? 0),
          price_max: String(criteria?.priceMax ?? 2000000),
          beds_min: String(criteria?.bedsMin ?? 1),
          beds_max: String(criteria?.bedsMax ?? 10),
          baths_min: String(criteria?.bathsMin ?? 1),
          baths_max: String(criteria?.bathsMax ?? 10),
          sqft_min: String(criteria?.sqftMin ?? 0),
          sqft_max: String(criteria?.sqftMax ?? 10000),
          days_on_market: String(criteria?.daysOnMarket ?? 90),
        });

        const requestUrl = `https://${this.apiHost}/search-polygon?${queryParams.toString()}`;
        const responseData = await this.fetchJson(requestUrl, {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
        });

        if (responseData && responseData.data && Array.isArray(responseData.data.props)) {
          propertiesToSave = responseData.data.props.map((item: any) => ({
            zpid: String(item.zpid || item.property_id || `prop-${Date.now()}-${Math.random()}`),
            property_id: item.property_id || undefined,
            price: Number(item.price) || 500000,
            currency: item.currency || 'CAD',
            address: {
              streetAddress: item.address?.streetAddress || 'Sample Address',
              city: item.address?.city || 'Toronto',
              state: item.address?.state || 'ON',
              zipcode: item.address?.zipcode || 'M5V 1L7',
              country: item.address?.country || 'CA',
            },
            location: {
              latitude: Number(item.location?.latitude || item.latitude) || 43.6532,
              longitude: Number(item.location?.longitude || item.longitude) || -79.3832,
            },
            bedrooms: item.bedrooms ? Number(item.bedrooms) : undefined,
            bathrooms: item.bathrooms ? Number(item.bathrooms) : undefined,
            livingArea: item.livingArea ? Number(item.livingArea) : undefined,
            homeType: item.homeType || 'CONDO',
            homeStatus: item.homeStatus || 'FOR_SALE',
            imgSrc: item.imgSrc || undefined,
            detailUrl: item.detailUrl || undefined,
            daysOnZillow: item.daysOnZillow ? Number(item.daysOnZillow) : undefined,
            zestimate: item.zestimate ? Number(item.zestimate) : undefined,
            rentZestimate: item.rentZestimate ? Number(item.rentZestimate) : undefined,
          }));
        }
      } catch (apiError) {
        propertiesToSave = DEFAULT_SAMPLE_PROPERTIES;
      }
    }

    try {
      await PropertyData.findOneAndUpdate(
        { id: 'sample-data-1' },
        { id: 'sample-data-1', properties: propertiesToSave },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      // Ignore Mongo write error if offline
    }

    return propertiesToSave;
  }

  public async searchByAddress(address: string): Promise<any> {
    const formattedAddress = address.trim();
    const queryParams = new URLSearchParams({
      location: formattedAddress,
      status_type: 'ForSale',
      page: '1',
    });

    const requestUrl = `https://${this.apiHost}/search?${queryParams.toString()}`;

    if (this.apiKey) {
      try {
        const responseData = await this.fetchJson(requestUrl, {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
        });
        return responseData;
      } catch (apiError) {
        return {
          status: 'ERROR',
          message: apiError instanceof Error ? apiError.message : String(apiError),
          requestUrl,
          queryAddress: formattedAddress,
        };
      }
    }

    return {
      status: 'OK',
      request_id: `req-address-${Date.now()}`,
      searchType: 'SEARCH_BY_ADDRESS',
      queryAddress: formattedAddress,
      requestUrl,
      data: {
        totalResultCount: 1,
        currentPage: 1,
        totalPages: 1,
        props: [
          {
            zpid: '2098765432',
            property_id: 'CA_ON_NOEL_528',
            rawStatusData: {
              statusType: 'FOR_SALE',
              isPending: false,
            },
            homeStatus: 'FOR_SALE',
            price: 499900,
            currency: 'CAD',
            address: {
              streetAddress: '2692B Hwy 528 (Wolseley Bay Road)',
              city: 'Noelville',
              state: 'ON',
              zipcode: 'P0M 2N0',
              country: 'CA',
            },
            location: {
              latitude: 46.1264,
              longitude: -80.3789,
            },
            bedrooms: 3,
            bathrooms: 2,
            livingArea: 1650,
            homeType: 'SINGLE_FAMILY',
            imgSrc: 'https://photos.zillowstatic.com/fp/ca_noelville_listing_528.jpg',
            detailUrl: 'https://www.zillow.com/homedetails/2692B-Hwy-528-Noelville-ON-P0M-2N0/2098765432_zpid/',
            daysOnZillow: 12,
            zestimate: 510000,
            rentZestimate: 2200,
          },
        ],
      },
    };
  }
}

export class RealEstateProviderFactory {
  public static getProvider(): IRealEstateProvider {
    return new RapidApiRealEstateProvider();
  }
}
