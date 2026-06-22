import Navbar from '@/components/Navbar/Navbar';
import TopBar from '@/components/TopBar/TopBar';
import Footer from '@/components/Footer/Footer';
import Loader from '@/components/Loader/Loader';
import "./globals.css";
import { ModalProvider } from '@/context/ModalContext';
import SubmitModal from '@/components/SubmitModal/SubmitModal';
import CookieConsent from '@/components/CookieConsent/CookieConsent';
import SpinWheelChallenge from '@/components/SpinWheelChallenge/SpinWheelChallenge';
import ArchiveAssistant from '@/components/ArchiveAssistant/ArchiveAssistant';

export const metadata = {
  title: "Maybeify | A Luxury Publishing House",
  description: "A high-end publication platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ModalProvider>
          <Loader />
          <TopBar />
          <Navbar />
          <SubmitModal />
          <CookieConsent />
          <SpinWheelChallenge />
          <main style={{ flex: 1, paddingTop: '130px' }}>
            {children}
          </main>
          <Footer />
        </ModalProvider>
      </body>
    </html>
  );
}


