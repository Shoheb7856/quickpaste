export default function PasteNotFound() {
    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px',
        }}>
            <div style={{
                fontSize: '72px',
                marginBottom: '16px',
            }}>
                🔍
            </div>
            <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '16px',
            }}>
                404 - Paste Not Found
            </h1>
            <p style={{
                fontSize: '16px',
                color: '#a1a1aa',
                marginBottom: '32px',
                maxWidth: '400px',
            }}>
                This paste does not exist, has expired, or has exceeded its view limit.
            </p>
            <a
                href="/"
                style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
            >
                Create a New Paste →
            </a>
        </div>
    );
}
