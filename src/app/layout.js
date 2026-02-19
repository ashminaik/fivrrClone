import './globals.css';
import Navbar from './components/Navbar';
import AuthProvider from './components/AuthProvider';

export const metadata = {
  title: 'fivrrClone — Find Top Freelance Talent',
  description: 'Discover and hire verified freelancers for web development, design, marketing, and more. Get quality work delivered fast.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
