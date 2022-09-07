import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Routes from './routes';
import GlobalStyles from './styles/global';
import Header from './components/Header';
import { CartProvider } from './hooks/useCart';

const isDev = process.env.NODE_ENV === 'development';

const App = (): JSX.Element => {
  return (
    <BrowserRouter basename={isDev ? '/' : process.env.PUBLIC_URL}>
      <CartProvider>
        <GlobalStyles />
        <Header />
        <Routes />
        <ToastContainer autoClose={3000} />
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
