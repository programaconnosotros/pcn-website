import { Testimonial } from '@/components/landing/testimonial';
import { CallToAction } from '@/components/landing/call-to-action';
import { Hero } from '@/components/landing/hero';
import { FrequentlyAskedQuestions } from '@/components/landing/frequently-asked-questions';
import { DiscordDemo } from '@/components/landing/discord-demo';
import { Footer } from '@/components/landing/footer';
import { Team } from '@/components/landing/team';
import { LightningTalks } from '@/components/landing/lightning-talks';
import { Motivation } from '@/components/landing/motivation';

const Home = () => (
  <div className="flex min-h-[100dvh] flex-col">
    <main className="flex-1">
      <Hero />
      <LightningTalks />
      <DiscordDemo />
      <Team />
      <Motivation />
      <Testimonial />
      <CallToAction />
      <FrequentlyAskedQuestions />
    </main>

    <Footer />
  </div>
);

export default Home;
