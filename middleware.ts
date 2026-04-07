import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match all pathnames except for specific exclusions
  matcher: [
    '/', 
    '/(zh-hk|zh-cn|en)/:path*',
    '/properties/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
