import { ChannelForm } from "../components/channel-form";
import { ChannelsTable } from "../components/channels-table";
import { api } from "../lib/api";

export default async function HomePage() {
  const channels = await api.listChannels();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-amber-900">Telegram Public Channel Scraper</h1>
        <p className="mt-1 text-sm text-slate-700">Cloudflare-oriented admin dashboard with bounded scraping and monthly progress.</p>
      </header>
      <ChannelForm />
      <ChannelsTable channels={channels.items} />
    </section>
  );
}
