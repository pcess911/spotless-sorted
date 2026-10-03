import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <img
            src="/logo.jpeg"
            alt="Spotless & Sorted"
            className="h-16 w-auto object-contain"
          />

          <a
            href="/book"
            className="rounded-full bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white"
          >
            Book a Service
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#f7f8fa]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-[#c99b3b]">
              Spotless & Sorted
            </p>

            <h1 className="text-4xl font-bold leading-tight text-[#0b1f3a] md:text-6xl">
              More time for what matters.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Professional cleaning and personal shopping services designed
              to make your everyday life easier.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/book"
                className="rounded-full bg-[#0b1f3a] px-7 py-4 font-semibold text-white"
              >
                Book a Service
              </a>

              <a
                href="https://wa.me/2349033435862"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-[#0b1f3a] px-7 py-4 font-semibold text-[#0b1f3a]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src="/logo.jpeg"
              alt="Spotless & Sorted logo"
              className="w-full max-w-sm rounded-3xl object-contain"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="font-semibold uppercase tracking-[0.2em] text-[#c99b3b]">
            What we do
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#0b1f3a] md:text-4xl">
            Services made for your lifestyle
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            From keeping your space spotless to helping you get things done,
            we give you back something valuable — your time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cleaning */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-5 text-4xl">🧹</div>

            <h3 className="text-2xl font-bold text-[#0b1f3a]">
              Professional Cleaning
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Reliable cleaning services for homes, apartments, offices and
              other spaces. We help keep your environment clean, fresh and
              comfortable.
            </p>

            <a
              href="/book"
              className="mt-6 inline-block font-semibold text-[#b1842f]"
            >
              Book cleaning →
            </a>
          </div>

          {/* Personal Shopping */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-5 text-4xl">🛍️</div>

            <h3 className="text-2xl font-bold text-[#0b1f3a]">
              Personal Shopping
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Need something bought or picked up? Let us handle the shopping
              while you focus on the things that matter to you.
            </p>

            <a
              href="/book"
              className="mt-6 inline-block font-semibold text-[#b1842f]"
            >
              Book shopping →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0b1f3a]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold md:text-4xl">
            Your time. Back.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-200">
            Let Spotless & Sorted take care of the tasks that keep you busy.
          </p>

          <a
            href="/book"
            className="mt-8 inline-block rounded-full bg-[#c99b3b] px-8 py-4 font-bold text-white"
          >
            Book a Service
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white px-6 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Spotless & Sorted</p>
        <p className="mt-2">Professional Cleaning & Personal Shopping Services</p>
      </footer>
    </main>
  );
}