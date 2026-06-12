"use client";

import { Calculator, Heart, Search, ShieldCheck, Star, ThumbsUp, Wallet, Wifi, X } from "lucide-react";
import { useState } from "react";
import { cities } from "../lib/cities";

const currencyRates = {
  USD: 1,
  SAR: 3.75,
  EUR: 0.93,
  GBP: 0.8,
};

const currencySymbols = {
  USD: "$",
  SAR: "﷼",
  EUR: "€",
  GBP: "£",
};

export default function Home() {
  const [income, setIncome] = useState("6500");
  const [currency, setCurrency] = useState("USD");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const formatMoney = (usdAmount) => {
    const converted = Math.round(usdAmount * currencyRates[currency]);
    return `${currencySymbols[currency]}${converted.toLocaleString()}`;
  };

  const cityCards = cities.map((city) => {
    return {
      ...city,
    };
  });

  const scoreRows = [
    { label: "Overall", Icon: Star },
    { label: "Cost", Icon: Wallet },
    { label: "Internet", Icon: Wifi },
    { label: "Liked", Icon: ThumbsUp },
    { label: "Safety", Icon: ShieldCheck },
  ];

  const calculator = (
    <form className="search-shell" onSubmit={(event) => event.preventDefault()}>
      <label className="search-field">
        <span>Your monthly income</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={income}
          onChange={(event) => setIncome(event.target.value)}
          placeholder="Enter income"
        />
      </label>
      <label className="search-field">
        <span>Select currency</span>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          aria-label="Select currency"
        >
          <option value="USD">USD</option>
          <option value="SAR">SAR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </label>
      <button className="search-button" type="submit" aria-label="Calculate">
        <Search size={22} strokeWidth={3} />
        <span>Calc</span>
      </button>
    </form>
  );

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

        <nav className="header-actions" aria-label="Account">
          <a className="start-button" href="#get-started">
            Get started
          </a>
        </nav>
      </header>

      <section className="search-band" aria-label="Search">
        {calculator}
      </section>

      <section className="content" id="get-started">
        <div className="city-grid" aria-label="City cost cards">
          {cityCards.map((city) => (
            <a className="city-card" href={`/city/${city.slug}`} key={city.city}>
              <img src={city.image} alt={`${city.city} city`} />
              <div className="corner-info top-left">
                <strong>{city.rank}</strong>
                <span>{city.country}</span>
              </div>
              <div className="corner-info top-right">
                <strong>{city.internet}</strong>
                <span>Mbps</span>
              </div>
              <div className="corner-info bottom-right">
                <strong>{city.weather}</strong>
                <span>Feels</span>
              </div>
              <div className="city-overlay">
                <h2>{city.city}</h2>
                <div className="city-cost">{formatMoney(city.monthlyCost)}/m</div>
              </div>
              <div className="city-hover" aria-label={`${city.city} score details`}>
                <div className="hover-actions" aria-hidden="true">
                  <Heart size={24} />
                  <X size={26} />
                </div>
                <div className="score-list">
                  {scoreRows.map(({ label, Icon }, index) => (
                    <div className="score-row" key={label}>
                      <span>
                        <Icon size={18} />
                        {label}
                      </span>
                      <div className="score-track">
                        <div
                          className={index === 1 || index === 2 ? "score-fill score-warn" : "score-fill"}
                          style={{ width: `${city.scores[index]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <button
        className="floating-calc"
        type="button"
        onClick={() => setIsCalculatorOpen(true)}
        aria-label="Open calculator"
      >
        <Calculator size={22} />
      </button>

      <div className={isCalculatorOpen ? "calc-sheet is-open" : "calc-sheet"} aria-hidden={!isCalculatorOpen}>
        <button
          className="sheet-backdrop"
          type="button"
          onClick={() => setIsCalculatorOpen(false)}
          aria-label="Close calculator"
        />
        <div className="sheet-panel" role="dialog" aria-modal="true" aria-label="Cost calculator">
          <div className="sheet-header">
            <strong>Calculate</strong>
            <button type="button" onClick={() => setIsCalculatorOpen(false)} aria-label="Close calculator">
              <X size={20} />
            </button>
          </div>
          {calculator}
        </div>
      </div>
    </main>
  );
}
