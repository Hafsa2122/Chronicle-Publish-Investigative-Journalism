import { useEffect, useState, useRef } from "react";
import {
  Archive, ArrowRight, ArrowUpRight, Blocks, Bold, BookOpen, ChevronRight,
  Clock, Code2, Edit3, Eye, FileText, Globe,
  Heading1, Highlighter, Image, Italic, Link2, List, Lock,
  Mail, Menu, Moon, Newspaper, PenLine, Quote, Search, Settings,
  Sun, Table2, Timer, TrendingUp, Type, Underline, Upload, Users, X, Zap
} from "lucide-react";

/* ===== PAGE REGISTRY ===== */
type PageId = string;
const MAIN_PAGES = [
  { id: "home", label: "Home", icon: Newspaper },
  { id: "editor", label: "Editor", icon: PenLine },
  { id: "reader", label: "Reader", icon: BookOpen },
  { id: "docs", label: "Documents", icon: FileText },
  { id: "collab", label: "Collaborate", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];
const MAIN_IDS = MAIN_PAGES.map((p) => p.id);

const INFO_PAGES: Record<string, { title: string; sections: { h: string; p: string }[] }> = {
  documentation: { title: "Documentation", sections: [
    { h: "Getting started", p: "Chronicle runs on Next.js 14 with Postgres and S3-compatible storage. Clone the repository, copy .env.example, run the database migrations, and start the dev server. The entire setup takes under 5 minutes on a modern machine." },
    { h: "Block schema", p: "The editor uses a custom Tiptap block schema with journalism-specific content types: timelines, document viewers, data tables, annotatable excerpts, pull quotes, and map embeds. Each block type is extensible and serializes to clean JSON." },
    { h: "Deployment", p: "Chronicle supports Vercel, Railway, Fly.io, and any Docker-compatible host. ISR (Incremental Static Regeneration) is configured by default — short pieces rebuild on every publish, long investigations rebuild on a 60-second revalidation." },
  ]},
  changelog: { title: "Changelog", sections: [
    { h: "v2.4.0 — June 2026", p: "Added collaborative cursor presence, improved timeline block rendering on mobile, and shipped the new annotation sidebar for the reader experience." },
    { h: "v2.3.0 — May 2026", p: "Paywall integration with Stripe, metered access configuration in admin, and newsletter gate component with customizable scroll-depth trigger." },
    { h: "v2.2.0 — April 2026", p: "Document viewer now supports multi-page PDF rendering with zoom controls, highlight persistence, and shared annotation threads." },
  ]},
  api: { title: "API Reference", sections: [
    { h: "Authentication", p: "All API requests require a Bearer token. Generate tokens from Settings → API Keys. Tokens are scoped to read, write, or admin permissions." },
    { h: "Stories endpoint", p: "GET /api/stories returns paginated story metadata. POST /api/stories creates a new draft. PUT /api/stories/:id updates content blocks. DELETE /api/stories/:id moves a story to trash." },
    { h: "Blocks endpoint", p: "GET /api/stories/:id/blocks returns the full block tree. POST /api/stories/:id/blocks appends a new block. PATCH /api/stories/:id/blocks/:blockId updates a single block in place." },
  ]},
  github: { title: "GitHub Repository", sections: [
    { h: "Open-source under MIT", p: "Chronicle is fully open-source. The repository contains the Next.js application, the Tiptap editor extensions, the reader experience components, and all database migrations." },
    { h: "Contributing", p: "We welcome contributions. Fork the repo, create a feature branch, write tests, and open a pull request. All PRs require at least one review from a core maintainer." },
    { h: "Issue tracker", p: "Bug reports and feature requests are tracked on GitHub Issues. Use the provided templates — they help us triage faster and ship fixes sooner." },
  ]},
  about: { title: "About Chronicle", sections: [
    { h: "Why we built this", p: "Existing CMS tools treat journalism like blog posts. Chronicle was designed from the ground up for investigative teams — structured story management, embedded primary sources, collaborative workflows, and a reading experience that respects 20,000-word investigations." },
    { h: "The team", p: "Chronicle is maintained by a small team of journalists and engineers who have worked in newsrooms and understand the editorial workflow. We build tools we want to use ourselves." },
    { h: "Open-source philosophy", p: "Journalism infrastructure should not be owned by any single company. Chronicle is MIT-licensed, self-hostable, and designed so that newsrooms retain full control of their content and data." },
  ]},
  blog: { title: "Blog", sections: [
    { h: "Building a CMS that journalists actually want to use", p: "Most CMS tools are built for marketers. We interviewed 40 investigative journalists across 12 newsrooms to understand what they actually need — and built Chronicle around those conversations." },
    { h: "How we handle 20,000-word articles at scale", p: "ISR, progressive hydration, and block-level lazy loading let Chronicle serve massive investigations in under 2 seconds. Here's how the architecture works under the hood." },
    { h: "The annotation system: design decisions", p: "Inline footnotes, margin annotations, and collaborative highlights all need to coexist without visual clutter. This post explains the design trade-offs we made." },
  ]},
  careers: { title: "Careers", sections: [
    { h: "We're hiring", p: "Chronicle is looking for frontend engineers (React, Tiptap), backend engineers (Node, Postgres), and a product designer with editorial experience. Remote-first, async-friendly." },
    { h: "How we work", p: "Small team, high trust, ship weekly. We do short async reviews, pair on hard problems, and give everyone direct access to the journalists who use Chronicle daily." },
    { h: "Benefits", p: "Competitive salary, equity, flexible hours, home office budget, and a conference stipend. We also run an internal prediction league — because we used to build those too." },
  ]},
  contact: { title: "Contact", sections: [
    { h: "Reach the team", p: "Email: hello@chronicle.dev. We read every message and respond within 48 hours. For security disclosures, use security@chronicle.dev with our PGP key." },
    { h: "Community", p: "Join the Chronicle Discord for real-time support, feature discussions, and newsroom workflow tips. We also host monthly community calls." },
    { h: "Enterprise", p: "Need SLA support, custom blocks, or private hosting? Contact enterprise@chronicle.dev for a conversation about your newsroom's needs." },
  ]},
  privacy: { title: "Privacy Policy", sections: [
    { h: "Data we collect", p: "Chronicle collects the minimum data needed to operate: account email, session tokens, and editor activity logs. We never sell data, never run ads, and never share individual usage patterns." },
    { h: "Self-hosted control", p: "When you self-host Chronicle, all data stays on your infrastructure. We have zero access to your content, your readers, or your analytics." },
    { h: "Cookies", p: "We use a session cookie and an optional theme preference cookie. No tracking pixels, no third-party analytics by default." },
  ]},
  terms: { title: "Terms of Service", sections: [
    { h: "Usage", p: "Chronicle is provided under the MIT license. You may use, modify, and distribute it freely. Attribution is appreciated but not required." },
    { h: "Hosted service", p: "If you use Chronicle's optional hosted service, you agree to use it for lawful purposes and not to abuse the infrastructure. We reserve the right to suspend accounts that violate these terms." },
    { h: "Liability", p: "Chronicle is provided as-is. We make no guarantees about uptime or fitness for a particular purpose. For enterprise SLAs, contact the team." },
  ]},
  status: { title: "System Status", sections: [
    { h: "All systems operational", p: "API: ✓ operational · Editor: ✓ operational · Reader: ✓ operational · Collaboration: ✓ operational · Deployments: ✓ operational. Last incident: none in the past 90 days." },
    { h: "Uptime", p: "99.98% uptime over the last 12 months. The hosted service runs on multi-region infrastructure with automatic failover." },
    { h: "Incident history", p: "No major incidents in Q2 2026. Minor: a 4-minute API latency spike on May 12 caused by a database index rebuild. Resolved automatically." },
  ]},
};

const ALL_SEARCHABLE = [
  ...MAIN_PAGES.map((p) => ({ id: p.id, label: p.label, desc: `Navigate to ${p.label}` })),
  ...Object.entries(INFO_PAGES).map(([id, p]) => ({ id, label: p.title, desc: p.sections[0].p.slice(0, 80) + "…" })),
];

/* ===== APP ===== */
export default function App() {
  const [page, setPage] = useState<PageId>("home");
  const [dir, setDir] = useState<"r" | "l">("r");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const navigate = (p: PageId) => {
    const ci = MAIN_IDS.indexOf(page);
    const ni = MAIN_IDS.indexOf(p);
    setDir(ni >= ci ? "r" : "l");
    setPage(p);
    setMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const infoPage = INFO_PAGES[page];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0e0f11] text-[#e4e4e7]" : "bg-paper text-ink"}`}>
      <Header page={page} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} dark={dark} setDark={setDark} onSearch={() => setSearchOpen(true)} />
      {searchOpen && <SearchModal dark={dark} navigate={navigate} onClose={() => setSearchOpen(false)} />}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div key={page} className={dir === "r" ? "anim-slide-l" : "anim-slide-r"}>
          {page === "home" && <HomePage navigate={navigate} dark={dark} />}
          {page === "editor" && <EditorPage dark={dark} />}
          {page === "reader" && <ReaderPage dark={dark} />}
          {page === "docs" && <DocsPage dark={dark} />}
          {page === "collab" && <CollabPage dark={dark} />}
          {page === "paywall" && <PaywallPage dark={dark} />}
        {page === "selfhosted" && <SelfHostedPage dark={dark} />}
          {infoPage && <InfoPage dark={dark} title={infoPage.title} sections={infoPage.sections} navigate={navigate} />}
        </div>
      </main>
      <Footer navigate={navigate} dark={dark} />
    </div>
  );
}

/* ===== SEARCH MODAL ===== */
function SearchModal({ dark, navigate, onClose }: { dark: boolean; navigate: (p: PageId) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = query.trim() ? ALL_SEARCHABLE.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase())) : ALL_SEARCHABLE;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed left-1/2 top-[12%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border shadow-2xl anim-scale ${dark ? "border-white/10 bg-[#18191d]" : "border-border bg-white"}`}>
        <div className={`flex items-center gap-3 border-b px-4 py-3 ${dark ? "border-white/10" : "border-border"}`}>
          <Search className="h-4 w-4 shrink-0" style={{ color: dark ? "#71717a" : "#9ca3af" }} />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pages, stories, documents..." className={`flex-1 bg-transparent text-sm outline-none ${dark ? "text-white placeholder:text-zinc-500" : "text-ink placeholder:text-ink-3"}`} />
          <button onClick={onClose} className={`rounded-lg border px-2 py-1 text-[10px] font-medium ${dark ? "border-white/10 text-zinc-400" : "border-border text-ink-3"}`}>ESC</button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <p className="p-4 text-center text-sm" style={{ color: dark ? "#71717a" : "#9ca3af" }}>No results found.</p>}
          {results.map((r) => (
            <button key={r.id} onClick={() => navigate(r.id)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${dark ? "hover:bg-white/5" : "hover:bg-paper-2"}`}>
              <Search className="mt-0.5 h-4 w-4 shrink-0" style={{ color: dark ? "#71717a" : "#9ca3af" }} />
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="mt-0.5 text-xs" style={{ color: dark ? "#71717a" : "#9ca3af" }}>{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ===== HEADER ===== */
function Header({ page, navigate, menuOpen, setMenuOpen, dark, setDark, onSearch }: { page: PageId; navigate: (p: PageId) => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void; dark: boolean; setDark: (v: boolean) => void; onSearch: () => void }) {
  const bg = dark ? "border-white/8 bg-[#0e0f11]/90" : "border-border bg-paper/90";
  const activeCls = dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper";
  const inactiveCls = dark ? "text-zinc-400 hover:bg-white/5 hover:text-white" : "text-ink-3 hover:bg-paper-2 hover:text-ink";
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${bg}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}><Newspaper className="h-4 w-4" /></div>
          <div className="hidden sm:block">
            <p className="text-[15px] font-semibold tracking-tight font-serif">Chronicle</p>
            <p className={`text-[10px] uppercase tracking-[0.2em] ${dark ? "text-zinc-500" : "text-ink-3"}`}>Publishing Engine</p>
          </div>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {MAIN_PAGES.map((p) => { const Icon = p.icon; return (
            <button key={p.id} onClick={() => navigate(p.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${page === p.id ? activeCls : inactiveCls}`}>
              <Icon className="h-3.5 w-3.5" />{p.label}
            </button>
          ); })}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onSearch} className={`hidden h-9 items-center gap-2 rounded-lg border px-3 text-[12px] sm:flex ${dark ? "border-white/10 bg-white/5 text-zinc-400" : "border-border bg-paper-2 text-ink-3"}`}>
            <Search className="h-3.5 w-3.5" />Search stories<kbd className={`ml-2 rounded border px-1 text-[10px] ${dark ? "border-white/10" : "border-border"}`}>⌘K</kbd>
          </button>
          <button onClick={() => setDark(!dark)} className={`h-9 w-9 flex items-center justify-center rounded-lg border transition hover:scale-105 ${dark ? "border-white/10 text-yellow-300 hover:bg-white/5" : "border-border text-ink-3 hover:bg-paper-2"}`}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg border" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : undefined }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className={`border-t p-4 md:hidden anim-fade-up ${dark ? "border-white/8 bg-[#0e0f11]" : "border-border bg-paper"}`}>
          {MAIN_PAGES.map((p) => { const Icon = p.icon; return (
            <button key={p.id} onClick={() => navigate(p.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${page === p.id ? activeCls : dark ? "text-zinc-300 hover:bg-white/5" : "text-ink-2 hover:bg-paper-2"}`}>
              <Icon className="h-4 w-4" />{p.label}
            </button>
          ); })}
        </div>
      )}
    </header>
  );
}

/* ===== FOOTER ===== */
function Footer({ navigate, dark }: { navigate: (p: PageId) => void; dark: boolean }) {
  const sections = [
    { t: "Product", links: [{ l: "Editor", p: "editor" }, { l: "Reader", p: "reader" }, { l: "Documents", p: "docs" }, { l: "Collaborate", p: "collab" }] },
    { t: "Resources", links: [{ l: "Documentation", p: "documentation" }, { l: "Changelog", p: "changelog" }, { l: "API Reference", p: "api" }, { l: "GitHub", p: "github" }] },
    { t: "Company", links: [{ l: "About", p: "about" }, { l: "Blog", p: "blog" }, { l: "Careers", p: "careers" }, { l: "Contact", p: "contact" }] },
  ];
  return (
    <footer className={`border-t ${dark ? "border-white/8 bg-[#131416]" : "border-border bg-paper-2"}`}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}><Newspaper className="h-3.5 w-3.5" /></div><span className="font-serif font-semibold">Chronicle</span></div>
          <p className={`mt-3 text-sm leading-7 ${dark ? "text-zinc-500" : "text-ink-3"}`}>Open-source CMS and reader experience built for investigative journalism teams.</p>
        </div>
        {sections.map((col) => (
          <div key={col.t}>
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-zinc-500" : "text-ink-3"}`}>{col.t}</p>
            <ul className="mt-3 space-y-2 text-sm">{col.links.map((lk) => <li key={lk.l}><button onClick={() => navigate(lk.p)} className={`transition ${dark ? "text-zinc-400 hover:text-white" : "text-ink-2 hover:text-link"}`}>{lk.l}</button></li>)}</ul>
          </div>
        ))}
      </div>
      <div className={`border-t ${dark ? "border-white/8" : "border-border"}`}><div className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row sm:px-6 lg:px-8 ${dark ? "text-zinc-600" : "text-ink-3"}`}>
        <span>© 2026 Chronicle Project. Open-source under MIT.</span>
        <div className="flex gap-4">
          <button onClick={() => navigate("privacy")} className={`${dark ? "hover:text-white" : "hover:text-link"}`}>Privacy</button>
          <button onClick={() => navigate("terms")} className={`${dark ? "hover:text-white" : "hover:text-link"}`}>Terms</button>
          <button onClick={() => navigate("status")} className={`${dark ? "hover:text-white" : "hover:text-link"}`}>Status</button>
        </div>
      </div></div>
    </footer>
  );
}

/* ===== INFO PAGE (for all footer links) ===== */
function InfoPage({ dark, title, sections, navigate }: { dark: boolean; title: string; sections: { h: string; p: string }[]; navigate: (p: PageId) => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className={`rounded-2xl border p-6 sm:p-10 anim-fade-up ${dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${dark ? "text-blue-400" : "text-link"}`}>Chronicle</p>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className={`mt-2 text-sm ${dark ? "text-zinc-500" : "text-ink-3"}`}>Last updated — June 2026</p>
        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={i} className={`anim-fade-up delay-${Math.min(i + 1, 6)}`}>
              <h2 className="text-xl font-semibold">{s.h}</h2>
              <p className={`mt-3 text-base leading-8 ${dark ? "text-zinc-300" : "text-ink-2"}`}>{s.p}</p>
            </section>
          ))}
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <button onClick={() => navigate("home")} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition hover:scale-[1.01] ${dark ? "border-white/10 text-zinc-300 hover:bg-white/5" : "border-border text-ink hover:bg-paper-2"}`}><ChevronRight className="h-4 w-4 rotate-180" />Back to home</button>
          <button onClick={() => navigate("editor")} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:scale-[1.01] ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}>Open the editor<ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

/* ===== ANIMATED NUMBER ===== */
function AnimatedNumber({ num, prefix = "", suffix = "" }: { num: number, prefix?: string, suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        hasAnimated = true;
        let startTime: number | null = null;
        const duration = 2000;

        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setValue(Math.floor(ease * num));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [num]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ===== HOME ===== */
function HomePage({ navigate, dark }: { navigate: (p: PageId) => void; dark: boolean }) {
  const stats = [
    { num: 20000, suffix: "+", l: "Word investigations", icon: FileText },
    { num: 2, prefix: "<", suffix: "s", l: "Load time target", icon: Zap },
    { num: 50, suffix: "+", l: "Embedded images", icon: Image },
    { num: 10, suffix: "+", l: "Data visualizations", icon: TrendingUp },
  ];
  const features = [
    { icon: Blocks, title: "Block-based Editor", desc: "Custom journalism blocks — timelines, document viewers, data tables, annotatable excerpts.", cta: "editor" },
    { icon: BookOpen, title: "Reading Experience", desc: "Progressive disclosure for 30,000-word investigations. Footnotes and focused reading mode.", cta: "reader" },
    { icon: FileText, title: "Document Viewer", desc: "Embedded PDFs, leaked documents, and primary source displays with annotate tools.", cta: "docs" },
    { icon: Users, title: "Collaborative Editing", desc: "Real-time co-editing with tracked changes, version history, and editorial commenting.", cta: "collab" },
    { icon: Lock, title: "Paywall & Newsletter", desc: "Gate integration for subscriber-only content, metered access, and newsletter signup.", cta: "paywall" },
    { icon: Globe, title: "Self-hosted & Open", desc: "Next.js + Postgres + S3. Deploy on your own infrastructure. Zero vendor lock-in.", cta: "selfhosted" },
  ];
  const cardBg = dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white";
  const statBg = dark ? "border-white/10 bg-white/[0.04]" : "border-border bg-paper-2";
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  const bodyText = dark ? "text-zinc-300" : "text-ink-2";

  return (
    <div className="space-y-16">
      <section className="pt-8 lg:pt-16">
        <p className={`anim-fade-up text-xs font-semibold uppercase tracking-[0.25em] ${dark ? "text-blue-400" : "text-link"}`}>Open-source Publishing</p>
        <h1 className="anim-fade-up delay-1 mt-4 font-serif text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
          The CMS built for<br /><span className="highlight-sweep">investigative journalism.</span>
        </h1>
        <p className={`anim-fade-up delay-2 mt-6 max-w-2xl text-lg leading-8 ${bodyText}`}>
          Chronicle is a full-stack publishing platform purpose-built for investigative and longform journalism — structured story management, multimedia embedding, collaborative editing, and a reading experience optimized for 5,000–30,000 word deep dives.
        </p>
        <div className="anim-fade-up delay-3 mt-8 flex flex-wrap gap-3">
          <button onClick={() => navigate("editor")} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90 ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}><PenLine className="h-4 w-4" />Open the editor</button>
          <button onClick={() => navigate("reader")} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition hover:opacity-80 ${dark ? "border-white/10 text-zinc-200" : "border-border text-ink"}`}><BookOpen className="h-4 w-4" />Read a story</button>
        </div>
        <div className="anim-fade-up delay-4 mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => { const Icon = s.icon; return (
            <div key={s.l} className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${statBg}`}>
              <Icon className={`h-5 w-5 ${dark ? "text-blue-400" : "text-link"}`} />
              <p className="mt-3 text-2xl font-bold tracking-tight"><AnimatedNumber num={s.num} prefix={s.prefix} suffix={s.suffix} /></p>
              <p className={`mt-1 text-xs ${mutedText}`}>{s.l}</p>
            </div>
          ); })}
        </div>
      </section>
      <hr className="editorial-rule" />
      <section>
        <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${mutedText}`}>Key Deliverables</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">Everything your newsroom needs</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => { const Icon = f.icon; return (
            <button key={f.title} onClick={() => navigate(f.cta)} className={`anim-fade-up delay-${i + 1} group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? "bg-yellow-500/15 text-yellow-400" : "bg-highlight-bg text-highlight"}`}><Icon className="h-5 w-5" /></div>
                <ArrowUpRight className={`h-4 w-4 transition ${dark ? "text-zinc-600 group-hover:text-blue-400" : "text-ink-3 group-hover:text-link"}`} />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
              <p className={`mt-2 text-sm leading-7 ${mutedText}`}>{f.desc}</p>
            </button>
          ); })}
        </div>
      </section>
      <section className={`rounded-2xl border p-6 sm:p-8 ${dark ? "border-yellow-500/30 bg-yellow-500/[0.06]" : "border-highlight/40 bg-highlight-bg"}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-yellow-400" : "text-highlight"}`}>⚡ Core Challenge</p>
        <p className="mt-3 font-serif text-lg leading-8">
          Journalists write in many formats — timeliness-driven news, slow-burn investigations, data-driven explainers — and no existing CMS handles all well. Chronicle must be flexible enough for all story types. <strong>Performance is critical:</strong> a 20,000-word investigation with 50 images and 10 data visualizations must load in under 2 seconds.
        </p>
      </section>
    </div>
  );
}

// Paywall page (extracted from SettingsPage paywall tab)
function PaywallPage({ dark }: { dark: boolean }) {
  const [paywallEnabled, setPaywallEnabled] = useState(true);
  const [meterLimit, setMeterLimit] = useState(3);
  const [saved, setSaved] = useState(true);

  const togglePaywall = () => { setPaywallEnabled(!paywallEnabled); setSaved(false); };
  const handleMeterChange = (e: React.ChangeEvent<HTMLInputElement>) => { setMeterLimit(+e.target.value); setSaved(false); };

  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  const cardBg = dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white";
  const activeCls = dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper";

  return (
    <div className="space-y-6">
      <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: dark ? "#71717a" : "#9ca3af" }}>Paywall Configuration</div>
      <div className={cardBg}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Paywall</h3>
          <button onClick={togglePaywall} className={`flex h-7 w-12 items-center rounded-full border px-1 transition ${paywallEnabled ? "border-green-500/30 bg-green-500/10 justify-end" : "border-border bg-paper-2 justify-start"}`}> <span className="h-5 w-5 rounded-full bg-white shadow"/> </button>
        </div>
        <p className={mutedText}>{paywallEnabled ? "Paywall active." : "Paywall disabled."}</p>
        {paywallEnabled && (
          <div className={`space-y-4 rounded-xl border p-4 anim-fade-up ${dark ? "border-white/10 bg-white/[0.02]" : "border-border bg-paper-2"}`}> 
            <label className="block">
              <span className="text-sm font-medium">Free article limit</span>
              <div className="mt-2 flex items-center gap-3">
                <input type="range" min={1} max={10} value={meterLimit} onChange={handleMeterChange} className="conf-slider flex-1"/>
                <span className="text-sm font-semibold tabular-nums w-8 text-center">{meterLimit}</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: dark ? "#71717a" : "#9ca3af" }}>{meterLimit} free article{meterLimit > 1 ? 's' : ''} before the gate.</p>
            </label>
          </div>
        )}
        <button onClick={() => setSaved(true)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeCls}`}> {saved ? "✓ Saved" : "Save changes"} </button>
      </div>
    </div>
  );
}

// Self-hosted page (deployment info extracted from SettingsPage deploy tab)
function SelfHostedPage({ dark }: { dark: boolean }) {
  const [deployStatus, setDeployStatus] = useState("idle" as "idle" | "deploying" | "deployed");
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  const cardBg = dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white";
  const activeCls = dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper";

  const deploy = () => {
    setDeployStatus("deploying");
    setTimeout(() => setDeployStatus("deployed"), 2000);
    setTimeout(() => setDeployStatus("idle"), 5000);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Deployment</h3>
      <div className={cardBg}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Production build</p>
            <p className={mutedText}>Last deployed: 2 hours ago</p>
          </div>
          <button onClick={deploy} disabled={deployStatus === "deploying"} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${deployStatus === "deployed" ? "bg-green-500 text-white" : deployStatus === "deploying" ? (dark ? "bg-white/50 text-[#0e0f11] cursor-wait" : "bg-ink/70 text-paper cursor-wait") : activeCls}`}> {deployStatus === "deploying" ? "Deploying..." : deployStatus === "deployed" ? "✓ Deployed" : "Deploy now"} </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ dark }: { dark: boolean }) {
  // Placeholder Settings page; can be expanded later.
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  return (
    <div className="space-y-6">
      <h3 className={mutedText}>Settings page placeholder</h3>
      <p className={mutedText}>The detailed settings can be accessed via the top navigation.</p>
    </div>
  );
}
function EditorPage({ dark }: { dark: boolean }) {
  const [blocks, setBlocks] = useState([
    { id: "b1", type: "heading", content: "The Panama Papers: Inside the Leak" },
    { id: "b2", type: "paragraph", content: "A massive leak of 11.5 million financial and legal records exposes a system that enables crime, corruption, and wrongdoing — hidden by secretive offshore companies." },
    { id: "b3", type: "quote", content: "These are the secrets of the powerful, the corrupt, and the criminal.", attribution: "— ICIJ Investigation Team" },
    { id: "b4", type: "timeline", events: ["April 3 — First documents received", "May 9 — Cross-border team formed", "June 18 — Pattern analysis begins", "Oct 4 — First publication"] },
    { id: "b5", type: "paragraph", content: "The investigation revealed how world leaders, celebrities, and criminals used shell companies to conceal their wealth. Over 214,000 offshore entities were identified across 21 tax havens." },
    { id: "b6", type: "datatable", headers: ["Entity","Jurisdiction","Value"], rows: [["Mossack Co.","Panama","$2.1B"],["Shell Ltd.","BVI","$840M"],["Apex Holdings","Seychelles","$1.4B"]] },
  ]);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(347);
  const [saved, setSaved] = useState(true);

  const updateBlock = (id: string, updates: any) => {
    setBlocks(p => p.map(b => b.id === id ? { ...b, ...updates } : b));
    setSaved(false);
  };

  const addBlock = (type: string) => {
    const id = "b" + Date.now();
    const b = type === "heading" ? { id, type: "heading", content: "New section heading" } : type === "quote" ? { id, type: "quote", content: "Enter quotation here...", attribution: "— Source" } : type === "timeline" ? { id, type: "timeline", events: ["Event 1", "Event 2"] } : type === "datatable" ? { id, type: "datatable", headers: ["Col A","Col B"], rows: [["—","—"]] } : { id, type: "paragraph", content: "Start writing your next paragraph..." };
    setBlocks((p) => [...p, b]); setActiveBlock(id); setSaved(false); setWordCount((w) => w + 12);
  };
  const deleteBlock = (id: string) => { setBlocks((p) => p.filter((b) => b.id !== id)); setActiveBlock(null); setSaved(false); };
  
  const handleToolbar = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    if (!activeBlock) return;

    const selection = window.getSelection();
    let isCollapsed = !selection || selection.isCollapsed;

    if (isCollapsed) {
      const blockEl = document.querySelector(`[data-block-id="${activeBlock}"] [contenteditable="true"]`);
      if (blockEl) {
        const range = document.createRange();
        range.selectNodeContents(blockEl);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    switch (action) {
      case 'Bold': document.execCommand('bold', false); break;
      case 'Italic': document.execCommand('italic', false); break;
      case 'Underline': document.execCommand('underline', false); break;
      case 'Highlight': document.execCommand('backColor', false, dark ? 'rgba(234, 179, 8, 0.4)' : 'rgba(253, 224, 71, 0.8)'); break;
      case 'Link': {
        const url = prompt('Enter link URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
      }
      case 'Code': document.execCommand('formatBlock', false, 'PRE'); break;
      case 'List': document.execCommand('insertUnorderedList', false); break;
      case 'Blockquote': document.execCommand('formatBlock', false, 'BLOCKQUOTE'); break;
    }

    if (isCollapsed) {
      selection?.removeAllRanges();
    }

    setSaved(false);
  };

  const toolbar = [{ icon: Bold, label: "Bold" },{ icon: Italic, label: "Italic" },{ icon: Underline, label: "Underline" },{ icon: Highlighter, label: "Highlight" },{ icon: Link2, label: "Link" },{ icon: Code2, label: "Code" },{ icon: List, label: "List" },{ icon: Quote, label: "Blockquote" }];
  const insertMenu = [{ icon: Type, label: "Paragraph", type: "paragraph" },{ icon: Heading1, label: "Heading", type: "heading" },{ icon: Quote, label: "Pull Quote", type: "quote" },{ icon: Timer, label: "Timeline", type: "timeline" },{ icon: Table2, label: "Data Table", type: "datatable" }];
  const cardBg = dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white";
  const activeCardBg = dark ? "border-blue-400/40 bg-blue-400/[0.05] shadow-lg shadow-blue-500/10" : "border-link/40 bg-link/[0.03] shadow-lg shadow-link/5";
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className={`text-xs font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Block Editor</p><h1 className="mt-1 font-serif text-2xl font-bold">Story workspace</h1></div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs ${dark ? "border-white/10 text-zinc-400" : "border-border text-ink-3"}`}>{wordCount} words</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${saved ? (dark ? "border border-green-500/30 bg-green-500/10 text-green-400" : "border border-success/30 bg-success/10 text-success") : (dark ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : "border border-highlight/40 bg-highlight-bg text-highlight")}`}>{saved ? "✓ Saved" : "Unsaved"}</span>
          <button onClick={() => setSaved(true)} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}>Save draft</button>
        </div>
      </div>
      <div className={`flex flex-wrap items-center gap-1 rounded-xl border p-2 anim-fade-up ${dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white"}`}>
        {toolbar.map((t) => <button key={t.label} title={t.label} onMouseDown={(e) => handleToolbar(e, t.label)} className={`rounded-lg p-2 transition ${dark ? "text-zinc-500 hover:bg-white/5 hover:text-white" : "text-ink-3 hover:bg-paper-2 hover:text-ink"}`}><t.icon className="h-4 w-4" /></button>)}
        <div className={`mx-2 h-5 w-px ${dark ? "bg-white/10" : "bg-border"}`} />
        {insertMenu.map((t) => <button key={t.label} onClick={() => addBlock(t.type)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${dark ? "text-zinc-500 hover:bg-yellow-500/10 hover:text-yellow-300" : "text-ink-3 hover:bg-highlight-bg hover:text-ink"}`}><t.icon className="h-3.5 w-3.5" />{t.label}</button>)}
      </div>
      <div className="space-y-3">
        {blocks.map((block, i) => { const isActive = activeBlock === block.id; return (
          <div key={block.id} data-block-id={block.id} className={`anim-fade-up delay-${Math.min(i+1,6)} group relative rounded-xl border p-5 transition cursor-pointer ${isActive ? activeCardBg : cardBg} hover:border-opacity-60`} onClick={() => setActiveBlock(block.id)}>
            {isActive && <button onClick={(e)=>{e.stopPropagation();deleteBlock(block.id);}} className="absolute right-3 top-3 rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 text-xs hover:bg-red-500/20"><X className="h-3 w-3" /></button>}
            <span className={`mb-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${dark ? "border-white/10 text-zinc-500" : "border-border text-ink-3"}`}>{block.type}</span>
            {block.type === "heading" && <h2 className="font-serif text-2xl font-bold outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: (block as any).content }} />}
            {block.type === "paragraph" && <p className={`text-[15px] leading-8 outline-none ${dark ? "text-zinc-300" : "text-ink-2"}`} contentEditable suppressContentEditableWarning onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: (block as any).content }} />}
            {block.type === "quote" && <blockquote className={`border-l-3 pl-4 italic text-[15px] leading-8 ${dark ? "border-l-yellow-400 text-zinc-300" : "border-l-highlight text-ink-2"}`}><div className="outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: (block as any).content }} /><footer className={`mt-2 text-xs not-italic outline-none ${mutedText}`} contentEditable suppressContentEditableWarning onBlur={(e) => updateBlock(block.id, { attribution: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: (block as any).attribution }} /></blockquote>}
            {block.type === "timeline" && <div className="space-y-2">{((block as any).events as string[]).map((e: string,j: number) => <div key={j} className="flex items-start gap-3"><div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dark ? "bg-blue-400" : "bg-link"}`} /><p className={`text-sm outline-none flex-1 ${dark ? "text-zinc-300" : "text-ink-2"}`} contentEditable suppressContentEditableWarning onBlur={(ev) => { const newEvs = [...(block as any).events]; newEvs[j] = ev.currentTarget.innerHTML; updateBlock(block.id, { events: newEvs }); }} dangerouslySetInnerHTML={{ __html: e }} /></div>)}</div>}
            {block.type === "datatable" && <div className="overflow-x-auto"><table className="w-full text-sm"><thead className={`text-xs uppercase tracking-wider ${dark ? "bg-white/5 text-zinc-500" : "bg-paper-2 text-ink-3"}`}><tr>{((block as any).headers as string[]).map((h: string, hi: number) => <th key={hi} className="px-4 py-2 text-left outline-none" contentEditable suppressContentEditableWarning onBlur={(ev) => { const newH = [...(block as any).headers]; newH[hi] = ev.currentTarget.innerHTML; updateBlock(block.id, { headers: newH }); }} dangerouslySetInnerHTML={{ __html: h }} />)}</tr></thead><tbody>{((block as any).rows as string[][]).map((row: string[], ri: number) => <tr key={ri} className={`border-t ${dark ? "border-white/8" : "border-border"}`}>{row.map((cell: string, ci: number) => <td key={ci} className="px-4 py-2 outline-none" contentEditable suppressContentEditableWarning onBlur={(ev) => { const newRows = [...(block as any).rows]; newRows[ri] = [...newRows[ri]]; newRows[ri][ci] = ev.currentTarget.innerHTML; updateBlock(block.id, { rows: newRows }); }} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>)}</tbody></table></div>}
          </div>
        ); })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {insertMenu.map((t) => <button key={t.label} onClick={() => addBlock(t.type)} className={`flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-2 text-xs font-medium transition ${dark ? "border-white/10 text-zinc-500 hover:border-blue-400/40 hover:text-blue-400" : "border-border text-ink-3 hover:border-link/40 hover:text-link"}`}><t.icon className="h-3.5 w-3.5" />+ {t.label}</button>)}
      </div>
    </div>
  );
}

/* ===== READER ===== */
function ReaderPage({ dark }: { dark: boolean }) {
  const [fontSize, setFontSize] = useState(18);
  const [showFootnotes, setShowFootnotes] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});
  useEffect(() => { const h = () => { const d = document.documentElement; setReadProgress(Math.min(100,Math.round(d.scrollTop/(d.scrollHeight-d.clientHeight)*100))); }; window.addEventListener("scroll",h); return () => window.removeEventListener("scroll",h); }, []);
  const sections = [
    { id:"s1", title:"I. The Source", body:"On an encrypted channel, a source who identified only as 'John Doe' reached out to a reporter at the Süddeutsche Zeitung. The message was simple: 'Hello. This is John Doe. Interested in data?' What followed was the largest leak of financial documents in history — 2.6 terabytes of data exposing the hidden financial dealings of some of the world's most powerful people.", footnote:"The term 'John Doe' has been used throughout to protect the source's identity." },
    { id:"s2", title:"II. The Pattern", body:"Analysis of the leaked records revealed a pattern: law firms in tax havens were creating shell companies that obscured the true ownership of assets. These structures were used by 140 politicians from more than 50 countries, including 12 current or former world leaders.", footnote:"Statistical analysis was performed using custom-built tools by the ICIJ data team." },
    { id:"s3", title:"III. The Revelations", body:"Among the revelations: a $2 billion trail leading to associates of the Russian president, undisclosed assets held by the prime ministers of Iceland and Pakistan, and hidden wealth belonging to associates of China's paramount leader.", footnote:"Due to the sensitivity of ongoing investigations, some names have been redacted." },
    { id:"s4", title:"IV. The Fallout", body:"Within a week of publication, Iceland's prime minister resigned. Tax authorities in dozens of countries launched investigations. Governments have recovered over $1.36 billion in unpaid taxes as a direct result of the investigation." },
  ];
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  const bodyText = dark ? "text-zinc-300" : "text-ink-2";
  return (
    <div className="space-y-6">
      <div className={`fixed left-0 top-0 z-50 h-0.5 transition-all duration-300 ${dark ? "bg-blue-400" : "bg-link"}`} style={{ width:`${readProgress}%` }} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${dark ? "bg-blue-400/10 text-blue-400" : "bg-link/10 text-link"}`}>Reader Mode</span><span className={`text-xs ${mutedText}`}>{readProgress}% read</span></div>
        <div className="flex items-center gap-2"><span className={`text-xs ${mutedText}`}>Font</span><input type="range" min={14} max={24} value={fontSize} onChange={(e)=>setFontSize(+e.target.value)} className="conf-slider w-24" /><span className="text-xs font-medium tabular-nums">{fontSize}px</span>
          <button onClick={()=>setShowFootnotes(!showFootnotes)} className={`ml-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${showFootnotes ? (dark ? "border-blue-400/30 bg-blue-400/10 text-blue-400" : "border-link/30 bg-link/10 text-link") : (dark ? "border-white/10 text-zinc-500" : "border-border text-ink-3")}`}>Footnotes {showFootnotes?"On":"Off"}</button>
        </div>
      </div>
      <article className="mx-auto max-w-3xl">
        <p className={`anim-fade-up text-xs font-semibold uppercase tracking-[0.25em] ${dark ? "text-blue-400" : "text-link"}`}>Investigation · Longform</p>
        <h1 className="anim-fade-up delay-1 mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">The Panama Papers: How the World's Rich Hide Their Money</h1>
        <div className={`anim-fade-up delay-2 mt-6 flex flex-wrap items-center gap-4 text-sm ${mutedText}`}><span className="flex items-center gap-1.5"><PenLine className="h-3.5 w-3.5" />ICIJ</span><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />18 min</span><span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />2.4M views</span></div>
        <hr className="editorial-rule my-8" />
        <div className="space-y-10" style={{fontSize:`${fontSize}px`}}>
          {sections.map((sec,i) => { const isExp = expanded[sec.id] !== false; return (
            <section key={sec.id} className={`anim-fade-up delay-${Math.min(i+1,6)}`}>
              <button onClick={()=>setExpanded(p=>({...p,[sec.id]:!isExp}))} className="flex w-full items-center justify-between text-left"><h2 className="font-serif text-xl font-semibold sm:text-2xl">{sec.title}</h2><ChevronRight className={`h-5 w-5 transition ${mutedText} ${isExp?"rotate-90":""}`} /></button>
              {isExp && <div className="mt-4 anim-fade-up"><p className={`leading-[1.9] ${bodyText} text-justify`} style={{fontSize:`${fontSize}px`}}>{sec.body}</p>
                {showFootnotes && sec.footnote && <div className={`mt-4 rounded-xl border p-4 text-sm leading-7 ${dark ? "border-white/10 bg-white/[0.03] text-zinc-400" : "border-border bg-paper-2 text-ink-3"}`}><span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}>{i+1}</span>{sec.footnote}</div>}
              </div>}
            </section>
          ); })}
        </div>
      </article>
    </div>
  );
}

/* ===== DOCUMENTS ===== */
function DocsPage({ dark }: { dark: boolean }) {
  const [selected, setSelected] = useState<number|null>(null);
  const [filter, setFilter] = useState("all");
  const docs = [
    { id:0, title:"Mossack Fonseca — Internal Memo #1247", type:"PDF", pages:14, date:"Mar 2016", status:"Verified", classification:"leaked", excerpt:"Internal communication regarding the establishment of shell entities in the British Virgin Islands." },
    { id:1, title:"Bearer Share Registry — Panama", type:"Database", pages:892, date:"Apr 2016", status:"Under review", classification:"primary", excerpt:"Complete registry of bearer share instruments issued between 2004 and 2015." },
    { id:2, title:"Correspondent Bank Transfers — Q3 2014", type:"Spreadsheet", pages:48, date:"Feb 2016", status:"Verified", classification:"leaked", excerpt:"Transaction records showing wire transfers between correspondent banks." },
    { id:3, title:"ICIJ Cross-reference Analysis", type:"Report", pages:26, date:"Sep 2016", status:"Published", classification:"analysis", excerpt:"Cross-reference analysis matching leaked entity records against public registries." },
    { id:4, title:"Source Communication Log (Redacted)", type:"Transcript", pages:8, date:"Jan 2016", status:"Redacted", classification:"primary", excerpt:"Encrypted communication transcripts between the original source and investigative team." },
  ];
  const filtered = filter==="all" ? docs : docs.filter(d=>d.classification===filter);
  const cardBg = dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white";
  const activeCardBg = dark ? "border-blue-400/40 bg-blue-400/[0.05] shadow-lg shadow-blue-500/10" : "border-link/40 bg-link/[0.03] shadow-lg shadow-link/5";
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  const activeCls = dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper";
  const inactiveCls = dark ? "text-zinc-400 hover:bg-white/5" : "text-ink-3 hover:bg-paper-2";
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className={`text-xs font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Document Viewer</p><h1 className="mt-1 font-serif text-2xl font-bold">Primary Sources & Evidence</h1></div>
        <div className={`flex gap-1 rounded-xl border p-1 ${dark ? "border-white/10" : "border-border"}`}>{["all","leaked","primary","analysis"].map(f=><button key={f} onClick={()=>setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter===f ? activeCls : inactiveCls}`}>{f}</button>)}</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">{filtered.map(doc=>{const isSel=selected===doc.id; return (
        <button key={doc.id} onClick={()=>setSelected(isSel?null:doc.id)} className={`anim-fade-up group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${isSel ? activeCardBg : cardBg}`}>
          <div className="flex items-start justify-between gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${dark ? "bg-white/5 text-zinc-400" : "bg-paper-2 text-ink-3"}`}><FileText className="h-5 w-5" /></div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${doc.status==="Verified" ? "border-green-500/30 bg-green-500/10 text-green-500" : doc.status==="Published" ? (dark ? "border-blue-400/30 bg-blue-400/10 text-blue-400" : "border-link/30 bg-link/10 text-link") : doc.status==="Redacted" ? "border-red-500/20 bg-red-500/10 text-red-400" : (dark ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : "border-highlight/40 bg-highlight-bg text-highlight")}`}>{doc.status}</span>
          </div>
          <h3 className="mt-3 text-[15px] font-semibold">{doc.title}</h3>
          <p className={`mt-2 text-sm leading-7 ${mutedText}`}>{doc.excerpt}</p>
          <div className={`mt-3 flex flex-wrap gap-2 text-[11px] ${mutedText}`}><span className={`rounded border px-2 py-0.5 ${dark ? "border-white/10" : "border-border"}`}>{doc.type}</span><span className={`rounded border px-2 py-0.5 ${dark ? "border-white/10" : "border-border"}`}>{doc.pages} pages</span><span className={`rounded border px-2 py-0.5 ${dark ? "border-white/10" : "border-border"}`}>{doc.date}</span></div>
          {isSel && <div className="mt-4 flex gap-2 anim-fade-up"><button className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dark ? "bg-white text-[#0e0f11]" : "bg-ink text-paper"}`}>View</button><button className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${dark ? "border-white/10 text-zinc-400" : "border-border text-ink-3"}`}>Download</button><button className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${dark ? "border-white/10 text-zinc-400" : "border-border text-ink-3"}`}>Annotate</button></div>}
        </button>
      );})}</div>
    </div>
  );
}

/* ===== COLLABORATE ===== */
function CollabPage({ dark }: { dark: boolean }) {
  const [comment,setComment]=useState("");
  const [comments,setComments]=useState([
    {id:1,author:"Sarah Chen",role:"Lead Editor",time:"12 min ago",text:"The section on bearer shares needs a stronger transition. Consider adding the regulatory context.",resolved:false},
    {id:2,author:"Marcus Webb",role:"Fact Checker",time:"34 min ago",text:"Verified: The $2.1B figure for Mossack Co. matches the court filing from Case No. 2016-CV-4821.",resolved:false},
    {id:3,author:"Lina Torres",role:"Data Journalist",time:"1h ago",text:"The timeline block rendering is clean but I'd suggest adding tooltips for the abbreviated dates.",resolved:true},
  ]);
  const [activeUsers]=useState(["Sarah Chen","Marcus Webb","Lina Torres","You"]);
  const [changes]=useState([
    {id:1,type:"edit",author:"Sarah Chen",desc:"Revised paragraph 3 — added regulatory context",time:"8 min ago"},
    {id:2,type:"add",author:"Marcus Webb",desc:"Added source verification footnote to section II",time:"22 min ago"},
    {id:3,type:"delete",author:"Lina Torres",desc:"Removed redundant data table",time:"1h ago"},
    {id:4,type:"edit",author:"You",desc:"Updated headline and deck copy",time:"2h ago"},
    {id:5,type:"edit",author:"You",desc:"Added more content on the right side",time:"Just now"},
  ]);
  const addComment=()=>{if(!comment.trim())return;setComments(p=>[{id:Date.now(),author:"You",role:"Writer",time:"Just now",text:comment,resolved:false},...p]);setComment("");};
  const cardBg = dark ? "border-white/10 bg-white/[0.03]" : "border-border bg-white";
  const mutedText = dark ? "text-zinc-500" : "text-ink-3";
  return (
    <div className="space-y-6">
      <div><p className={`text-xs font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Collaboration</p><h1 className="mt-1 font-serif text-2xl font-bold">Editorial workspace</h1></div>
      <div className={`flex items-center gap-3 rounded-xl border p-4 anim-fade-up ${cardBg}`}>
        <div className="flex -space-x-2">{activeUsers.map((u,i)=><div key={u} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white ${dark ? "border-[#18191d] bg-blue-500" : "border-white bg-link"}`} style={{zIndex:4-i}}>{u.split(" ").map(x=>x[0]).join("")}</div>)}</div>
        <div><p className="text-sm font-medium">{activeUsers.length} editors online</p><p className={`text-xs ${mutedText}`}>Real-time collaborative editing via Yjs</p></div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-500"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"/>Live sync</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4"><h3 className="text-sm font-semibold">Tracked changes</h3>
          {changes.map(c=>(<div key={c.id} className={`anim-fade-up rounded-xl border p-4 ${cardBg}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${c.type==="edit" ? (dark?"bg-blue-400/10 text-blue-400":"bg-link/10 text-link") : c.type==="add" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}`}>{c.type==="edit"?<Edit3 className="h-3.5 w-3.5"/>:c.type==="add"?<span>+</span>:<X className="h-3.5 w-3.5"/>}</div><div><p className="text-sm font-medium">{c.desc}</p><p className={`mt-1 text-xs ${mutedText}`}>{c.author} · {c.time}</p></div></div></div>))}
        </div>
        <div className="space-y-4"><h3 className="text-sm font-semibold">Comments ({comments.filter(c=>!c.resolved).length} open)</h3>
          <div className={`rounded-xl border p-4 ${cardBg}`}><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a note for the editorial team..." rows={3} className={`w-full resize-none rounded-lg border p-3 text-sm outline-none ${dark?"border-white/10 bg-white/[0.03] text-white placeholder:text-zinc-600 focus:border-blue-400/40":"border-border bg-paper-2 focus:border-link/40"}`}/><div className="mt-2 flex justify-end"><button onClick={addComment} disabled={!comment.trim()} className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${dark?"bg-white text-[#0e0f11]":"bg-ink text-paper"}`}>Post comment</button></div></div>
          {comments.map(c=>(<div key={c.id} className={`anim-fade-up rounded-xl border p-4 ${c.resolved ? (dark?"border-white/5 bg-white/[0.02] opacity-60":"border-border bg-paper-2 opacity-70") : cardBg}`}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-sm font-medium">{c.author}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] ${dark?"border-white/10 text-zinc-500":"border-border text-ink-3"}`}>{c.role}</span></div><span className={`text-[11px] ${mutedText}`}>{c.time}</span></div><p className={`mt-2 text-sm leading-7 ${dark?"text-zinc-300":"text-ink-2"}`}>{c.text}</p><div className="mt-3 flex gap-2"><button onClick={()=>setComments(p=>p.map(x=>x.id===c.id?{...x,resolved:!x.resolved}:x))} className={`rounded-lg border px-3 py-1 text-[11px] font-medium transition ${c.resolved?(dark?"border-blue-400/30 bg-blue-400/10 text-blue-400":"border-link/30 bg-link/10 text-link"):(dark?"border-white/10 text-zinc-500 hover:bg-white/5":"border-border text-ink-3 hover:bg-paper-2")}`}>{c.resolved?"✓ Resolved":"Resolve"}</button><button className={`rounded-lg border px-3 py-1 text-[11px] font-medium ${dark?"border-white/10 text-zinc-500 hover:bg-white/5":"border-border text-ink-3 hover:bg-paper-2"}`}>Reply</button></div></div>))}
        </div>
      </div>
    </div>
  );
}
