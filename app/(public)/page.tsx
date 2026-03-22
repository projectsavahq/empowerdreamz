// import Homepage from "./home/page";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'var(--font-nunito-sans)',
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1a1a2e' }}>
        🚧 We're Coming Soon
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#444', maxWidth: '500px', lineHeight: 1.7 }}>
        The <strong>Empowerdreams</strong> website is currently under construction. 
        We're working hard to bring you something amazing. Check back soon!
      </p>
      <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.95rem' }}>
        For enquiries, reach out to us at{' '}
        <a href="mailto:info@empowerdreams.org" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
          info@empowerdreams.org
        </a>
      </p>
    </div>
  )
}

{/* TO GO LIVE - uncomment the code below and delete everything above:

import Homepage from "./home/page";

export default function Home() {
  return (
    <div>
      <Homepage/>
    </div>
  );
}

*/}