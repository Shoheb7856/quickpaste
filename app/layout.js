import './globals.css';

export const metadata = {
  title: 'QuickPaste - Share Text Instantly',
  description: 'A fast and secure way to share text content with customizable expiration options. Create shareable links in seconds.',
  keywords: ['pastebin', 'text sharing', 'code sharing', 'quick paste', 'temporary paste'],
  authors: [{ name: 'QuickPaste' }],
  openGraph: {
    title: 'QuickPaste - Share Text Instantly',
    description: 'A fast and secure way to share text content with customizable expiration options.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">
          <header className="header">
            <div className="container">
              <div className="header-content">
                <a href="/" className="logo">
                  <div className="logo-icon">QP</div>
                  <div>
                    <div className="logo-text">QuickPaste</div>
                    <div className="logo-tagline">Share text instantly</div>
                  </div>
                </a>
              </div>
            </div>
          </header>

          <main className="main-content">
            <div className="container">
              {children}
            </div>
          </main>

          <footer className="footer">
            <div className="container">
              <p>
                Made with ❤️ | Pastes may expire based on your settings
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
