import Link from "next/link";

export default function Home() {
  return (
    <main className="container flex-col items-center justify-center fade-in text-center mt-8">
      <div className="card max-w-md w-full">
        <h1>Welcome to MindGuard</h1>
        <p className="mb-8">A Supportive Digital Space for Student Mental Well-Being. Your Privacy is Our Priority.</p>
        <p className="mb-8">Feel Free to Express Yourself!</p>

        <div className="flex-col gap-4">
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="w-full">Let's Get Started!</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
