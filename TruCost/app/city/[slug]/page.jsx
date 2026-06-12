import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CloudSun,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Utensils,
  Wifi,
} from "lucide-react";
import { notFound } from "next/navigation";
import { cities } from "../../../lib/cities";

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const city = cities.find((item) => item.slug === slug);

  return {
    title: city ? `${city.city} - TruCost.com` : "City - TruCost.com",
  };
}

export default async function CityPage({ params }) {
  const { slug } = await params;
  const city = cities.find((item) => item.slug === slug);

  if (!city) {
    notFound();
  }

  const dailyCost = Math.round(city.monthlyCost / 30);
  const monthlyBills = Math.round(city.monthlyCost * 0.38);
  const rentCost = Math.round(city.monthlyCost * 0.48);
  const foodCost = Math.round(city.monthlyCost * 0.22);
  const transportCost = Math.round(city.monthlyCost * 0.08);
  const lifestyleCost = city.monthlyCost - rentCost - foodCost - transportCost;
  const overallScore = city.scores[0];
  const costScore = city.scores[1];
  const safetyScore = city.scores[4];

  const qualityLabel =
    overallScore >= 85 ? "Excellent" : overallScore >= 75 ? "Very good" : overallScore >= 65 ? "Good" : "Okay";
  const cityDescription = `${city.city} is a practical cost guide for ${city.country}, built around the expenses that matter first: rent, recurring bills, food, transport, and everyday lifestyle.`;

  const costRows = [
    {
      label: "Monthly bills",
      note: "Recurring fixed expenses",
      amount: monthlyBills,
      score: costScore,
      tone: "warm",
      Icon: Banknote,
    },
    {
      label: "Rent",
      note: "Typical 1 bedroom apartment",
      amount: rentCost,
      score: 100 - Math.min(92, Math.round((rentCost / city.monthlyCost) * 100)),
      tone: "neutral",
      Icon: Home,
    },
    {
      label: "Food",
      note: "Groceries and simple meals out",
      amount: foodCost,
      score: 76,
      tone: "good",
      Icon: Utensils,
    },
    {
      label: "Transport",
      note: "Metro, taxis, and local movement",
      amount: transportCost,
      score: 84,
      tone: "good",
      Icon: TrainFront,
    },
    {
      label: "Lifestyle",
      note: "Coffee, fitness, and weekend plans",
      amount: lifestyleCost,
      score: city.scores[3],
      tone: "good",
      Icon: Sparkles,
    },
  ];

  const cityFacts = [
    { label: "Daily cost", value: `$${dailyCost}/d`, Icon: CalendarDays },
    { label: "Internet", value: `${city.internet} Mbps`, Icon: Wifi },
    { label: "Weather", value: city.weather, Icon: CloudSun },
    { label: "Safety", value: `${safetyScore}/100`, Icon: ShieldCheck },
  ];

  return (
    <main>
      <header className="site-header" aria-label="Primary">
        <a className="brand" href="/" aria-label="TruCost.com home">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-line" />
            <span className="brand-curve" />
            <span className="brand-dot" />
          </span>
          <span>TruCost.com</span>
        </a>
        <a className="start-button" href="/">
          <ArrowLeft size={15} />
          Back
        </a>
      </header>

      <section className="detail-hero">
        <img src={city.image} alt={`${city.city} city`} />
        <div className="detail-overlay">
          <p>
            <MapPin size={16} />
            {city.country}
          </p>
          <h1>{city.city}</h1>
          <strong>${city.monthlyCost.toLocaleString()}/month</strong>
        </div>
      </section>

      <section className="detail-content" aria-label={`${city.city} cost details`}>
        <div className="city-summary">
          <div>
            <span className="eyebrow">Simple cost guide</span>
            <h2>What it feels like to live in {city.city}</h2>
            <p>{cityDescription}</p>
          </div>
          <div className="summary-score" aria-label={`Overall score ${overallScore} out of 100`}>
            <span>{qualityLabel}</span>
            <strong>{overallScore}</strong>
            <small>overall</small>
          </div>
        </div>

        <div className="fact-grid">
          {cityFacts.map(({ label, value, Icon }) => (
            <article className="fact-card" key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="cost-panel">
          {costRows.map(({ label, note, amount, score, tone, Icon }) => (
            <article className="cost-detail-row" key={label}>
              <div className="cost-icon">
                <Icon size={26} />
              </div>
              <div className="cost-copy">
                <div className="cost-title-line">
                  <div>
                    <h3>{label}</h3>
                    <p>{note}</p>
                  </div>
                  <span className={`quality-pill ${tone}`}>
                    {score >= 80 ? "Very good" : score >= 65 ? "Good" : "High"}
                  </span>
                </div>
                <div className="range-line" aria-label={`${label} score ${score} out of 100`}>
                  <div className="range-bars">
                    <span className="range-segment green" />
                    <span className="range-segment lime" />
                    <span className="range-segment yellow" />
                    <span className={`range-segment marker ${tone}`} style={{ "--score": `${score}%` }} />
                    <span className="range-segment red" />
                  </div>
                  <strong>${amount.toLocaleString()}</strong>
                </div>
                <div className="range-labels" aria-hidden="true">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
