import '@/styles/index.scss';

import 'virtual:svg-icons-register';
import '@/plugins';
import queryString from 'query-string';
import { getFromLS } from 'mayanbet-sdk';
import '@/js/sign-up';
import useViewportSizes from '@/js/use-viewport-sizes';
import '@/js/pwa';

useViewportSizes();

const searchString = queryString.parse(window.location.search);

const isAlreadyRegistered = getFromLS('isAlreadyRegistered');
if (isAlreadyRegistered && !searchString.debug) {
  searchString['sign-in'] = true;
  const stringifiedSearch = queryString.stringify(searchString);

  window.location.replace(
    `${import.meta.env.VITE_REDIRECT_URL}/?${stringifiedSearch}`,
  );
}
