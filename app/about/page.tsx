import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | The Silent Archive",
  description: "The manifesto of The Silent Archive.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-black p-12 md:p-24">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
          Manifesto
        </h1>
      </header>
      <div className="flex-1 p-8 md:p-12 max-w-4xl mx-auto w-full">
        <div className="prose prose-neutral prose-lg max-w-none font-sans">
          <p className="text-2xl font-bold uppercase tracking-tight mb-8">
            We reject the noise.
          </p>
          <p className="mb-6">
            The Silent Archive is a digital sanctuary for thoughts that demand to be read, not just consumed. In an era of infinite scroll and algorithmic feeds, we choose stasis. We choose permanence.
          </p>
          <p className="mb-6">
            Our design is brutalist not out of nostalgia, but out of necessity. We strip away the decorative to reveal the structural. Content is king; everything else is distraction.
          </p>
          <div className="border-l-4 border-black pl-6 my-12">
            <p className="text-xl italic font-serif">
              "To write is to carve meaning from the silence."
            </p>
          </div>
          <p>
            This platform is built with Next.js, Tailwind CSS, and Supabase. It is open source, transparent, and unapologetically raw.
          </p>
        </div>
      </div>
    </div>
  );
}
