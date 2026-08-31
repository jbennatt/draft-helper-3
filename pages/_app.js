import Head from 'next/head';
import '../styles/globals.css';
import { withBasePath } from '../utils/basePath';

export default function App({ Component, pageProps }) {
   return (
    <>
      <Head>
        <link rel="icon" href={withBasePath('/favicon.ico')} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}