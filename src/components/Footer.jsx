export default function Footer() {
  return (
    <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
      <div className="container">
        <p className="text-secondary m-0" style={{ fontSize: '0.8rem' }}>
          <strong>Disclaimer:</strong> MindGuard is a student well-being tool, not a replacement for professional medical help.
          If you are experiencing a crisis, please contact emergency services immediately.
        </p>
        <p className="text-secondary mt-2" style={{ fontSize: '0.8rem' }}>
          Your data is anonymous and securely protected.
        </p>
      </div>
    </footer>
  );
}
