import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hk-cre-platform.vercel.app';
const locales = ['en', 'zh-hk', 'zh-cn'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at');

  const routes = ['', '/properties'];
  
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap(locale =>
    routes.map(route => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [`${l === 'en' ? 'en-HK' : l === 'zh-hk' ? 'zh-HK' : 'zh-CN'}`, `${baseUrl}/${l}${route}`])
        ),
      },
    }))
  );
  
  const propertyEntries = locales.flatMap(locale =>
    (properties || []).map(property => ({
      url: `${baseUrl}/${locale}/properties/${property.id}`,
      lastModified: new Date(property.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [`${l === 'en' ? 'en-HK' : l === 'zh-hk' ? 'zh-HK' : 'zh-CN'}`, `${baseUrl}/${l}/properties/${property.id}`])
        ),
      },
    }))
  );
  
  return [...staticEntries, ...propertyEntries];
}
