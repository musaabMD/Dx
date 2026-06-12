"use client";

import { Bookmark, ExternalLink, ListFilter, PlusCircle, Send, Triangle, X } from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

export type ResourceProduct = {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
  date: string;
  dateGroup: "today" | "week" | "month" | "older";
  link: string;
  votes: number;
};

type FilterMode = "all" | "today" | "week" | "month" | "top" | "trending";

function resourceClass(value: string) {
  return `resource-type-${value.toLowerCase().replaceAll(" ", "-")}`;
}

function ResourceCard({
  active,
  accentColor,
  href,
  iconLetter,
  onUpvote,
  product,
}: {
  active: boolean;
  accentColor: string;
  href: string;
  iconLetter: string;
  onUpvote: () => void;
  product: ResourceProduct;
}) {
  const displayVotes = product.votes + (active ? 1 : 0);
  const [saved, setSaved] = useState(false);

  return (
    <div className={`vote-resource-card ${resourceClass(product.badge)}`}>
      <button
        aria-pressed={active}
        className={["vote-box", active ? "is-active" : ""].join(" ")}
        style={
          {
            "--accent-color": accentColor,
          } as CSSProperties
        }
        onClick={onUpvote}
        type="button"
      >
        <Triangle aria-hidden="true" fill={active ? accentColor : "none"} size={18} strokeWidth={2.4} />
        <span>{displayVotes}</span>
      </button>
      <div
        className="vote-card-icon"
        style={
          {
            "--accent-color": accentColor,
          } as CSSProperties
        }
      >
        {iconLetter}
      </div>
      <a className="vote-card-body" href={href}>
        <span className="vote-card-title-row">
          <span className="vote-card-title">{product.title}</span>
        </span>
        <span className="vote-card-tagline">{product.subtitle}</span>
        <span className="vote-card-meta">
          <span>{product.date}</span>
          <span aria-hidden="true">·</span>
          <span className="vote-card-tag">{product.badge}</span>
        </span>
      </a>
      <div className="vote-card-actions">
        <ActionButton active={saved} accentColor={accentColor} label="Save" onClick={() => setSaved((value) => !value)}>
          <Bookmark aria-hidden="true" fill={saved ? accentColor : "none"} size={14} strokeWidth={2} />
        </ActionButton>
        <ActionButton label="Share">
          <Send aria-hidden="true" size={14} strokeWidth={2} />
        </ActionButton>
        <a aria-label={`Open ${product.title}`} className="vote-action-button" href={href}>
          <ExternalLink aria-hidden="true" size={14} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

function ActionButton({
  accentColor,
  active,
  children,
  label,
  onClick,
}: {
  accentColor?: string;
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={["vote-action-button", active ? "is-active" : ""].join(" ")}
      onClick={onClick}
      style={
        {
          "--accent-color": accentColor ?? "#4f6ef7",
        } as CSSProperties
      }
      type="button"
    >
      {children}
    </button>
  );
}

export function ResourceProductHub({
  basePath,
  initialResourceType = "All",
  products,
  resourceTypes,
}: {
  basePath: string;
  contextTitle: string;
  initialResourceType?: string;
  products: ResourceProduct[];
  resourceTypes: string[];
}) {
  const allResourceTypes = useMemo(() => ["All", ...resourceTypes.filter((type) => type !== "All")], [resourceTypes]);
  const selectedInitialResourceType = allResourceTypes.includes(initialResourceType) ? initialResourceType : "All";
  const [filter, setFilter] = useState<FilterMode>("all");
  const [showSubmit, setShowSubmit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());
  const folderInputProps = {
    directory: "",
    webkitdirectory: "",
  };

  const toggle = (id: number) => {
    setUpvoted((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visible = products.filter((product) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "today") {
      return product.dateGroup === "today";
    }

    if (filter === "week") {
      return product.dateGroup === "today" || product.dateGroup === "week";
    }

    if (filter === "month") {
      return product.dateGroup !== "older";
    }

    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    const aVotes = a.votes + (upvoted.has(a.id) ? 1 : 0);
    const bVotes = b.votes + (upvoted.has(b.id) ? 1 : 0);

    if (filter === "trending") {
      return bVotes / Math.max(b.id, 1) - aVotes / Math.max(a.id, 1);
    }

    return bVotes - aVotes;
  });

  const filterOptions: Array<[FilterMode, string]> = [
    ["all", "All"],
    ["today", "✨ Today"],
    ["week", "📅 This week"],
    ["month", "🗓️ This month"],
    ["top", "🏆 Top votes"],
    ["trending", "🔥 Trending"],
  ];

  return (
    <div className="resource-hub">
      <nav className="catalog-tabs detail-resource-tabs">
        {allResourceTypes.map((type) => (
          <span key={type} className="resource-tab-control">
            <input defaultChecked={selectedInitialResourceType === type} id={`resource-type-${resourceClass(type)}`} name="resource-type" type="radio" />
            <label htmlFor={`resource-type-${resourceClass(type)}`}>{type}</label>
          </span>
        ))}
        <details className="resource-filter-menu">
          <summary>
            <ListFilter aria-hidden="true" size={15} strokeWidth={2.3} />
            Filter
          </summary>
          <div className="resource-filter-dropdown">
            {filterOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={(event) => {
                  setFilter(value);
                  event.currentTarget.closest("details")?.removeAttribute("open");
                }}
                className={filter === value ? "is-active" : ""}
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      </nav>
      <button className="detail-submit-button detail-submit-floating" onClick={() => setShowSubmit(true)} type="button">
        <PlusCircle aria-hidden="true" size={18} strokeWidth={2.2} />
        Submit
      </button>

      {showSubmit ? (
        <div className="resource-submit-modal" role="dialog" aria-modal="true" aria-label="Submit resource">
          <button className="resource-submit-scrim" type="button" onClick={() => setShowSubmit(false)} aria-label="Dismiss submit popup" />
          <form
            className="resource-submit-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              setSuccess(true);
              window.setTimeout(() => {
                setShowSubmit(false);
                setSuccess(false);
              }, 1100);
            }}
          >
            <button className="resource-submit-close" type="button" onClick={() => setShowSubmit(false)} aria-label="Close submit popup">
              <X aria-hidden="true" size={16} strokeWidth={2.3} />
            </button>
            <p>Submit resource</p>
            <h2>Add to this exam</h2>
            {success ? <div className="resource-submit-success">Added successfully.</div> : null}
            <label>
              <span>Resource link</span>
              <input name="link" placeholder="Paste link" type="url" />
            </label>
            <label>
              <span>Resource type</span>
              <select name="type" defaultValue={resourceTypes[0] ?? "Qbank"}>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="resource-submit-drop">
              <strong>Drop a folder here</strong>
              <span>or choose a folder</span>
              <input aria-label="Upload resource folder" type="file" multiple {...folderInputProps} />
            </label>
            <button type="submit">Add resource</button>
          </form>
        </div>
      ) : null}

      <div className="catalog-grid">
        {sorted.map((product, index) => {
          const accentColor = ["#ff6154", "#2f855a", "#6d5dfc", "#0f766e", "#be185d", "#2563eb", "#b45309"][index % 7];
          const href = `${basePath}/${encodeURIComponent(product.title.toLowerCase().replaceAll(" ", "-"))}`;
          return (
            <ResourceCard
              key={product.id}
              accentColor={accentColor}
              active={upvoted.has(product.id)}
              href={href}
              iconLetter={product.title.charAt(0).toUpperCase()}
              product={product}
              onUpvote={() => toggle(product.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
