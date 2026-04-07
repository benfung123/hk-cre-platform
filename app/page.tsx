import {redirect} from 'next/navigation';
 
// This page only renders when the app is used without a locale,
// so the middleware redirects to the preferred locale.
export default function RootPage() {
  redirect('/en');
}
