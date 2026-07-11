import Image from "next/image";
import { getFeaturedProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";

const marqueeItems = [
  "ৰসুনৰ আচাৰ",
  "Garlic",
  "মুৰ্গী মাংস আচাৰ",
  "Chicken",
  "আমলাখি আচাৰ",
  "Amla",
  "আম জলকীয়া আচাৰ",
  "Mango Chilli",
  "ভোট জলকীয়া আচাৰ",
  "Ghost Pepper",
  "Cold-pressed mustard oil",
  "Small batch, big flavour",
  "No preservatives",
];

const storyPhotos = [
  { src: "/story/kitchen.png", caption: "Our kitchen in Barpeta" },
  { src: "/story/sun-drying.png", caption: "Sun-drying chillies" },
  { src: "/story/amla-harvest.png", caption: "Amla harvest" },
  { src: "/story/bottling.png", caption: "Hand-bottling" },
];

const testimonials = [
  {
    name: "Kabita Sharma",
    city: "Guwahati",
    rating: 5,
    text: "Every jar tastes like home. My family in Delhi now orders monthly.",
  },
  {
    name: "Nikhil Verma",
    city: "Bengaluru",
    rating: 5,
    text: "The ghost pepper pickle is unreal. Authentic Assamese heat, delivered fresh.",
  },
  {
    name: "Ipsita Roy",
    city: "Kolkata",
    rating: 4,
    text: "Beautifully packed, no preservatives, and you can taste the mustard oil.",
  },
];

export default async function LandingPage() {
  const featured = await getFeaturedProducts(6);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28">
        <span className="inline-block rounded-full border border-line bg-paper/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-mustard">
          Cold-pressed mustard oil · Small batch
        </span>
        <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.05] text-ink sm:text-7xl">
          The taste of <span className="italic text-terra-d">Assam</span>, in a jar.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink2">
          Sun-cured garlic, tangy amla, zesty raw mango and fiery bhut jolokia (ghost pepper) —
          pickled the way our <span className="italic">aai</span> (mother) taught us, packed fresh
          to your door.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            Shop the pickles
          </ButtonLink>
          <ButtonLink href="#story" size="lg" variant="secondary">
            Our story
          </ButtonLink>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-8 text-sm">
          <Stat value="4.8★" label="3,200+ ratings" />
          <Stat value="100%" label="No preservatives" />
          <Stat value="2-day" label="Fresh dispatch" />
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-line bg-paper/40 py-3">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap text-sm text-ink2">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              {item}
              <span className="text-terra">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mustard">
              Our jars
            </p>
            <h2 className="mt-1 font-serif text-4xl font-semibold text-ink">
              Five pickles, endless meals
            </h2>
          </div>
          <ButtonLink href="/shop" variant="ghost">
            View all →
          </ButtonLink>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="border-y border-line bg-deep/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mustard">
              Since our kitchen in Barpeta
            </p>
            <h2 className="mt-1 font-serif text-4xl font-semibold text-ink">
              Recipes passed down, never rushed.
            </h2>
            <p className="mt-4 text-lg text-ink2">
              Every jar is sun-cured for days and bottled in cold-pressed mustard oil — the same
              slow method Assamese homes have used for generations. No shortcuts, no preservatives.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["সূৰ্য-শুকান · Sun-cured", "Cold-pressed oil", "Hand-bottled"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-paper/60 px-4 py-2 text-sm text-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {storyPhotos.map((photo) => (
              <figure
                key={photo.src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line"
              >
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep/90 to-transparent px-3 py-2 text-xs text-ink">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center font-serif text-4xl font-semibold text-ink">
          Loved across India
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-line bg-paper/70 p-6">
              <Stars rating={t.rating} />
              <blockquote className="mt-3 text-ink">&ldquo;{t.text}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm text-ink2">
                {t.name} · {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl font-semibold text-ink">{value}</div>
      <div className="text-ink2">{label}</div>
    </div>
  );
}
