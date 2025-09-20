import { storageService, getPublicUrl, safeFileName, buildObjectPath } from '../../lib/storage';

// Mock supabase storage module behavior via jest mocks on supabase client
jest.mock('../../lib/supabase', () => {
  const upload = jest.fn().mockResolvedValue({ data: { path: 'restaurants/r1/logo.png' }, error: null });
  const remove = jest.fn().mockResolvedValue({ data: null, error: null });
  const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/storage/v1/object/public/restaurants/r1/logo.png' } });
  return {
    supabase: {
      storage: {
        from: jest.fn().mockImplementation((bucket: string) => ({
          upload,
          remove,
          getPublicUrl,
        })),
      },
    },
    supabaseAdmin: null, // not needed for client-side tests here
  };
});

describe('storage service (client)', () => {
  it('safeFileName should normalize text', () => {
    expect(safeFileName('Café de la Casa.png')).toBe('cafe-de-la-casa.png');
    expect(safeFileName('   __Weird   Name__  ')).toBe('__weird-name__');
  });

  it('buildObjectPath should join and clean segments', () => {
    expect(buildObjectPath(['restaurants/', '/r1 ', ' logo.png '])).toBe('restaurants/r1/logo.png');
  });

  it('uploadFile returns publicUrl when makePublic', async () => {
    const res = await storageService.uploadFile({
      bucket: 'restaurant-images',
      path: 'restaurants/r1/logo.png',
      body: new Uint8Array([1,2,3]),
      contentType: 'image/png',
      makePublic: true,
    });
    expect(res.publicUrl).toContain('/storage/v1/object/public/');
  });

  it('getPublicUrl returns a string', () => {
    const url = getPublicUrl({ bucket: 'restaurant-images', path: 'restaurants/r1/logo.png' });
    expect(typeof url).toBe('string');
    expect(url).toContain('restaurants/r1/logo.png');
  });
});
