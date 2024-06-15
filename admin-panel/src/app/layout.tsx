import './globals.css';
import { SocketsProvider } from '@/context';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SocketsProvider>{children}</SocketsProvider>
      </body>
    </html>
  );
}
