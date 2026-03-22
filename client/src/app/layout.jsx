import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: 'Low Price Luxury | Affordable Watches, Shoes, Perfumes & More',
  description: 'Shop premium luxury watches, shoes, perfumes, bags and accessories at unbeatable prices. Quality luxury for everyone.',
  keywords: 'luxury watches, luxury shoes, affordable luxury, perfumes, designer bags',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
            <div id="recaptcha-container" />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'toast-luxury',
                duration: 3000,
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
