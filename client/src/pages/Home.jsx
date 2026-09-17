import React, { useEffect, useState } from "react";

/**
 * EaseRX — Premium Clinical SaaS Homepage
 *
 * Self-contained homepage.
 * Uses the original Clinical Precision color system:
 * Primary:   #132359
 * Secondary: #00658d
 * Cyan:      #2dbcfe
 */

const COLORS = {
  primary: "#132359",
  primaryContainer: "#2b3a70",
  secondary: "#00658d",
  cyan: "#2dbcfe",

  bg: "#f5f8fc",
  surface: "#ffffff",
  surfaceSoft: "#eef4fa",

  onBg: "#15191e",
  onVariant: "#5d6672",

  outline: "#d9e1e9",

  success: "#18a873",
  successSoft: "#e2f7ef",

  purple: "#7565e8",
  purpleSoft: "#eeeaff",

  orange: "#f29b52",
  orangeSoft: "#fff0e3",

  red: "#dc5b68",
  redSoft: "#ffe8eb",
};

/* =========================================================
   ICON
   ========================================================= */

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,

    checkCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),

    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),

    stethoscope: (
      <>
        <path d="M6 3v5a6 6 0 0 0 12 0V3" />
        <path d="M6 3H4" />
        <path d="M18 3h2" />
        <path d="M12 14v3a4 4 0 0 0 8 0v-1" />
        <circle cx="20" cy="14" r="1.5" />
      </>
    ),

    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
        <path d="M8 9h2" />
      </>
    ),

    receipt: (
      <>
        <path d="M4 2v20l3-2 3 2 2-2 3 2 3-2 2 2V2l-3 2-3-2-2 2-3-2-3 2Z" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
      </>
    ),

    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 3-4 3 2 5-7" />
      </>
    ),

    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    bolt: (
      <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
    ),

    sparkles: (
      <>
        <path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3Z" />
        <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14Z" />
        <path d="m5 15-.6 1.9L2.5 17.5l1.9.6L5 20l.6-1.9 1.9-.6-1.9-.6L5 15Z" />
      </>
    ),

    whatsapp: (
      <>
        <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L4 20l1.2-3.7A8.5 8.5 0 1 1 20.5 11.5Z" />
        <path d="M9 8.5c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c.7 1.2 1.7 2.1 3 2.7l.6-.6c.2-.2.4-.2.7-.1l1.7.8c.3.1.4.3.3.6-.1.5-.4 1-.9 1.3-.5.3-1.3.3-2.1.1-3.7-1-6.1-3.5-7-6.1-.2-.7-.2-1.5.1-2.1.3-.5.8-.9 1.2-1.1Z" />
      </>
    ),

    print: (
      <>
        <path d="M6 9V3h12v6" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v7H6z" />
      </>
    ),

    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.2 18.8a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.08 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.82 2 2 0 0 1-.45 2.11L8.06 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.82.7A2 2 0 0 1 22 16.92Z" />
    ),

    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
      </>
    ),

    mobile: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),

    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
}

/* =========================================================
   DATA
   ========================================================= */

const FEATURES = [
  {
    icon: "dashboard",
    title: "Unified Dashboard",
    text: "Patients, prescriptions, billing and revenue in one intelligent workspace.",
    color: COLORS.primary,
    soft: "#e7ebff",
  },
  {
    icon: "users",
    title: "Smart Patient Records",
    text: "Instantly recall patient history, previous prescriptions and important details.",
    color: COLORS.secondary,
    soft: "#dff4fb",
  },
  {
    icon: "document",
    title: "Rx Builder",
    text: "Create detailed multi-medicine prescriptions with dosage and refill instructions.",
    color: COLORS.purple,
    soft: COLORS.purpleSoft,
  },
  {
    icon: "receipt",
    title: "Integrated Billing",
    text: "Turn saved prescriptions into matching invoices without duplicate data entry.",
    color: COLORS.orange,
    soft: COLORS.orangeSoft,
  },
  {
    icon: "print",
    title: "Live PDF Preview",
    text: "Preview letterhead, margins, scale and print layout before generating the final PDF.",
    color: COLORS.success,
    soft: COLORS.successSoft,
  },
  {
    icon: "shield",
    title: "Credential Verification",
    text: "Verify professional credentials to unlock advanced prescribing capabilities.",
    color: COLORS.primary,
    soft: "#e7ebff",
  },
  {
    icon: "chart",
    title: "Practice Analytics",
    text: "Understand patient volume, prescription activity and clinic performance.",
    color: COLORS.secondary,
    soft: "#dff4fb",
  },
  {
    icon: "mobile",
    title: "Every Screen",
    text: "A responsive experience designed for desktop, tablet and mobile workflows.",
    color: COLORS.purple,
    soft: COLORS.purpleSoft,
  },
];

const STEPS = [
  {
    number: "01",
    icon: "users",
    title: "Add your patient",
    text: "Enter patient details once. Returning patients are recalled instantly.",
  },
  {
    number: "02",
    icon: "document",
    title: "Build the prescription",
    text: "Select medicines, dosage and instructions with a professional Rx builder.",
  },
  {
    number: "03",
    icon: "receipt",
    title: "Generate the bill",
    text: "The matching invoice is generated automatically from your prescription.",
  },
  {
    number: "04",
    icon: "whatsapp",
    title: "Share or print",
    text: "Send the finished PDF digitally or print it with precise alignment.",
  },
];

const PROBLEMS = [
  {
    icon: "document",
    title: "Manual prescriptions",
    text: "Handwritten prescriptions take time and can look inconsistent.",
  },
  {
    icon: "database",
    title: "Scattered patient data",
    text: "Important patient history becomes difficult to find when needed.",
  },
  {
    icon: "receipt",
    title: "Disconnected billing",
    text: "Repeating information between prescriptions and invoices wastes time.",
  },
  {
    icon: "whatsapp",
    title: "Hard to share",
    text: "Patients increasingly expect fast digital communication.",
  },
  {
    icon: "print",
    title: "Printing headaches",
    text: "Manual formatting makes letterhead and PDF printing unnecessarily difficult.",
  },
  {
    icon: "chart",
    title: "Limited visibility",
    text: "Without analytics, understanding clinic activity becomes guesswork.",
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "₹400",
    period: "/month",
    tagline: "A simple starting point for individual practices.",
    features: [
      "Unlimited patients",
      "Prescription generation",
      "Patient records",
      "Standard PDF export",
    ],
  },
  {
    name: "Pro",
    price: "₹7,000",
    period: "/2 years",
    tagline: "Everything active practices need to work smarter.",
    features: [
      "Unlimited patients",
      "Advanced Rx templates",
      "Integrated billing",
      "Practice analytics",
      "Priority email support",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "₹1,999",
    period: "/month",
    tagline: "A complete workflow for larger medical teams.",
    features: [
      "Everything in Pro",
      "Multi-doctor management",
      "Custom branding",
      "Advanced analytics",
      "Priority support",
       "Unlimited patients",
      "Advanced Rx templates",
      "Integrated billing",
      "Practice analytics",
      "Priority email support",
      "WhatsApp automation support",
    ],
  },
];

const TESTIMONIALS = [
  {
    initials: "PS",
    quote:
      "EaseRX saves me hours every week. My prescriptions finally look as professional as the care I provide.",
    name: "Dr. Priya Sharma",
    role: "General Physician",
  },
  {
    initials: "RP",
    quote:
      "The ability to send prescriptions digitally has made our patient communication dramatically smoother.",
    name: "Dr. Rajesh Patel",
    role: "Clinic Owner",
  },
  {
    initials: "AD",
    quote:
      "The PDF workflow and analytics give our clinic the polished digital experience we were missing.",
    name: "Dr. Anika Desai",
    role: "Pediatrician",
  },
];

/* =========================================================
   REVEAL HOOK
   ========================================================= */

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("erx-visible")
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("erx-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
}

/* =========================================================
   LOGO
   ========================================================= */

function Logo() {
  return (
    <a href="#top" className="erx-logo">
      <span className="erx-logo-mark">
        🦷
      </span>

      <span className="erx-logo-copy">
        <strong>EaseRX</strong>
        <small>PROFESSIONAL</small>
      </span>
    </a>
  );
}

/* =========================================================
   NAV
   ========================================================= */

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <header className="erx-header">
      <div className="erx-nav-wrap">
        <Logo />

        <nav className={`erx-nav ${menuOpen ? "erx-nav-open" : ""}`}>
          <a href="#features" onClick={close}>
            Features
          </a>
          <a href="#workflow" onClick={close}>
            Workflow
          </a>
          <a href="#pricing" onClick={close}>
            Pricing
          </a>
          <a href="#reviews" onClick={close}>
            Reviews
          </a>

          <div className="erx-mobile-nav-actions">
            <a href="/login" className="erx-btn erx-btn-light">
              Login
            </a>
            <a href="/login" className="erx-btn erx-btn-primary">
              Get Started
            </a>
          </div>
        </nav>

        <div className="erx-nav-actions">
          <a href="/login" className="erx-login">
            Login
          </a>

          <a href="/login" className="erx-btn erx-btn-primary erx-btn-small">
            Get Started
            <Icon name="arrow" size={15} />
          </a>

          <button
            className="erx-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <Icon
              name={menuOpen ? "close" : "menu"}
              size={22}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   HERO DASHBOARD
   ========================================================= */

function DashboardMockup() {
  return (
    <div className="erx-dashboard-scene">
      <div className="erx-dashboard-glow" />

      <div className="erx-dashboard">
        <div className="erx-dashboard-sidebar">
          <div className="erx-mini-brand">
            <span>
              <Icon name="stethoscope" size={14} />
            </span>
          </div>

          <div className="erx-sidebar-items">
            <div className="active">
              <Icon name="dashboard" size={15} />
            </div>
            <div>
              <Icon name="users" size={18} />
            </div>
            <div>
              <Icon name="document" size={15} />
            </div>
            <div>
              <Icon name="receipt" size={15} />
            </div>
            <div>
              <Icon name="chart" size={15} />
            </div>
          </div>
        </div>

        <div className="erx-dashboard-main">
          <div className="erx-dashboard-top">
            <div>
              <span>Tuesday, 30 August</span>
              <strong>Good morning, Dr. Sharma</strong>
            </div>

            <div className="erx-dashboard-avatar">
              PS
            </div>
          </div>

          <div className="erx-dashboard-title">
            <div>
              <h3>Practice overview</h3>
              <span>Everything is looking healthy.</span>
            </div>

            <button>
              <Icon name="plus" size={14} />
              New prescription
            </button>
          </div>

          <div className="erx-stat-grid">
            <div className="erx-dashboard-stat">
              <div className="stat-icon blue">
                <Icon name="users" size={15} />
              </div>
              <span>Patients</span>
              <strong>1,248</strong>
              <small>+12.8%</small>
            </div>

            <div className="erx-dashboard-stat">
              <div className="stat-icon cyan">
                <Icon name="document" size={15} />
              </div>
              <span>Prescriptions</span>
              <strong>8,340</strong>
              <small>+18.4%</small>
            </div>

            <div className="erx-dashboard-stat">
              <div className="stat-icon purple">
                <Icon name="receipt" size={15} />
              </div>
              <span>Receipts</span>
              <strong>3,192</strong>
              <small>+9.2%</small>
            </div>
          </div>

          <div className="erx-dashboard-content">
            <div className="erx-chart-card">
              <div className="erx-chart-header">
                <div>
                  <span>Prescription activity</span>
                  <strong>2,842</strong>
                </div>

                <span className="erx-chart-period">
                  Last 30 days
                </span>
              </div>

              <div className="erx-chart">
                <div className="erx-chart-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

                <svg
                  viewBox="0 0 520 180"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0"
                        stopColor="#2dbcfe"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="1"
                        stopColor="#2dbcfe"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    className="erx-chart-area"
                    d="M0 145 C45 125 55 138 90 112 C120 90 145 120 175 95 C205 70 220 100 250 82 C285 60 305 78 335 55 C365 32 390 68 420 48 C450 28 480 42 520 16 L520 180 L0 180 Z"
                  />

                  <path
                    className="erx-chart-line"
                    d="M0 145 C45 125 55 138 90 112 C120 90 145 120 175 95 C205 70 220 100 250 82 C285 60 305 78 335 55 C365 32 390 68 420 48 C450 28 480 42 520 16"
                  />

                  <circle
                    cx="420"
                    cy="48"
                    r="5"
                    className="erx-chart-point"
                  />
                </svg>

                <div className="erx-chart-months">
                  <span>Aug 01</span>
                  <span>Aug 08</span>
                  <span>Aug 15</span>
                  <span>Aug 22</span>
                  <span>Aug 30</span>
                </div>
              </div>
            </div>

            <div className="erx-recent-card">
              <div className="erx-recent-head">
                <span>Recent patients</span>
                <Icon name="arrow" size={14} />
              </div>

              {[
                ["AS", "Aarav Shah", "Today · 10:42"],
                ["MK", "Meera Kapoor", "Today · 10:18"],
                ["RK", "Rahul Kumar", "Today · 09:54"],
              ].map((patient) => (
                <div
                  className="erx-patient"
                  key={patient[1]}
                >
                  <span>{patient[0]}</span>
                  <div>
                    <strong>{patient[1]}</strong>
                    <small>{patient[2]}</small>
                  </div>
                  <Icon name="arrow" size={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="erx-floating-card erx-floating-card--top">
        <span className="floating-icon">
          <Icon name="checkCircle" size={17} />
        </span>

        <div>
          <strong>Prescription saved</strong>
          <small>Just now · #RX-8294</small>
        </div>
      </div>

      <div className="erx-floating-card erx-floating-card--bottom">
        <span className="floating-icon cyan">
          <Icon name="chart" size={17} />
        </span>

        <div>
          <small>Monthly growth</small>
          <strong>+18.4%</strong>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  return (
    <section className="erx-hero" id="top">
      <div className="erx-hero-grid" />

      <div className="erx-orb erx-orb-one" />
      <div className="erx-orb erx-orb-two" />

      <div className="erx-wrap">
        <div className="erx-hero-content">
          <div className="erx-hero-badge">
            <span>
              🦷
            </span>
            Built for modern clinics
          </div>

          <h1>
            Your practice,
            <br />
            <span>finally in sync.</span>
          </h1>

          <p>
            EaseRX brings prescriptions, patient records, billing and
            practice insights into one beautifully simple workspace
            built for healthcare professionals.
          </p>

          <div className="erx-hero-buttons">
            <a href="/login" className="erx-btn erx-btn-primary erx-btn-large">
              Start for free
              <Icon name="arrow" size={17} />
            </a>

            <a href="#workflow" className="erx-btn erx-btn-glass erx-btn-large">
              See how it works
              <span className="erx-play">
                ▶
              </span>
            </a>
          </div>

          <div className="erx-hero-trust">
            <div className="erx-avatar-stack">
              <span>PS</span>
              <span>RP</span>
              <span>AD</span>
              <span>+</span>
            </div>

            <div>
              <div className="erx-stars">
                ★★★★★
              </div>
              <strong>Loved by modern practitioners</strong>
            </div>
          </div>
        </div>

        <DashboardMockup />
      </div>

      <div className="erx-scroll-indicator">
        <span>Scroll to explore</span>
        <i />
      </div>
    </section>
  );
}

/* =========================================================
   LOGO STRIP
   ========================================================= */

function TrustStrip() {
  return (
    <section className="erx-trust-strip">
      <div className="erx-wrap">
        <span className="erx-trust-label">
          A smarter workflow for
        </span>

        <div className="erx-trust-items">
          <span>
            <Icon name="stethoscope" size={16} />
            GENERAL PRACTICE
          </span>

          <span>
            <Icon name="users" size={16} />
            SPECIALISTS
          </span>

          <span>
            <Icon name="document" size={16} />
            CLINICS
          </span>

          <span>
            <Icon name="database" size={16} />
            MEDICAL CENTRES
          </span>

          <span>
            <Icon name="chart" size={16} />
            GROWING PRACTICES
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROBLEM
   ========================================================= */

function ProblemSection() {
  return (
    <section className="erx-section erx-problem">
      <div className="erx-wrap">
        <div className="erx-section-intro erx-center">
          <span className="erx-eyebrow erx-eyebrow-red">
            The old way
          </span>

          <h2>
            Your practice deserves
            <br />
            <span>better than this.</span>
          </h2>

          <p>
            Modern patients expect modern experiences. But many
            practices still rely on disconnected, manual workflows.
          </p>
        </div>

        <div className="erx-problem-grid">
          {PROBLEMS.map((problem, index) => (
            <div
              className="erx-problem-card"
              key={problem.title}
              data-reveal
              style={{
                transitionDelay: `${index * 60}ms`,
              }}
            >
              <div className="erx-problem-icon">
                <Icon name={problem.icon} size={20} />
              </div>

              <div>
                <h3>{problem.title}</h3>
                <p>{problem.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="erx-problem-bottom">
          <div className="erx-problem-line" />
          <span>There is a better way</span>
          <div className="erx-problem-line" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SOLUTION
   ========================================================= */

function SolutionSection() {
  return (
    <section className="erx-section erx-solution">
      <div className="erx-solution-bg" />

      <div className="erx-wrap">
        <div className="erx-solution-grid">
          <div
            className="erx-solution-copy"
            data-reveal
          >
            <span className="erx-eyebrow">
              <Icon name="sparkles" size={13} />
              The EaseRX difference
            </span>

            <h2>
              One workspace.
              <br />
              <span>Everything connected.</span>
            </h2>

            <p>
              EaseRX removes the repetitive work between consultation,
              prescription and billing. One action flows naturally
              into the next.
            </p>

            <div className="erx-solution-checks">
              {[
                "Less repetitive data entry",
                "Professional digital prescriptions",
                "Faster patient communication",
                "Clearer practice visibility",
              ].map((item) => (
                <div key={item}>
                  <span>
                    <Icon name="check" size={13} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <a href="/login" className="erx-text-button">
              Explore EaseRX
              <Icon name="arrow" size={16} />
            </a>
          </div>

          <div
            className="erx-flow-visual"
            data-reveal
          >
            <div className="erx-flow-card erx-flow-card-main">
              <div className="erx-flow-card-top">
                <span className="erx-flow-icon blue">
                  <Icon name="document" size={19} />
                </span>

                <span className="erx-flow-status">
                  <i />
                  SAVED
                </span>
              </div>

              <small>NEW PRESCRIPTION</small>

              <strong>
                Rx · Aarav Shah
              </strong>

              <div className="erx-rx-lines">
                <span />
                <span />
                <span />
              </div>

              <div className="erx-flow-footer">
                <span>
                  <Icon name="checkCircle" size={14} />
                  Patient linked
                </span>

                <span>10:42 AM</span>
              </div>
            </div>

            <div className="erx-flow-connector connector-one">
              <span />
            </div>

            <div className="erx-flow-card erx-flow-card-billing">
              <span className="erx-flow-icon purple">
                <Icon name="receipt" size={18} />
              </span>

              <div>
                <small>INVOICE GENERATED</small>
                <strong>₹1,850</strong>
              </div>

              <Icon name="checkCircle" size={19} />
            </div>

            <div className="erx-flow-connector connector-two">
              <span />
            </div>

            <div className="erx-flow-card erx-flow-card-share">
              <span className="erx-flow-icon cyan">
                <Icon name="whatsapp" size={18} />
              </span>

              <div>
                <small>READY TO SHARE</small>
                <strong>Prescription.pdf</strong>
              </div>

              <span className="erx-share-arrow">
                <Icon name="arrow" size={15} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURES
   ========================================================= */

function FeaturesSection() {
  return (
    <section className="erx-section erx-features" id="features">
      <div className="erx-wrap">
        <div className="erx-section-intro erx-center">
          <span className="erx-eyebrow">
            Everything connected
          </span>

          <h2>
            Powerful tools.
            <br />
            <span>Beautifully simple.</span>
          </h2>

          <p>
            Every feature is designed to remove friction from your
            everyday clinical workflow.
          </p>
        </div>

        <div className="erx-feature-grid">
          {FEATURES.map((feature, index) => (
            <div
              className="erx-feature-card"
              key={feature.title}
              data-reveal
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <div
                className="erx-feature-icon"
                style={{
                  color: feature.color,
                  background: feature.soft,
                }}
              >
                <Icon name={feature.icon} size={21} />
              </div>

              <span className="erx-feature-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>

              <span
                className="erx-feature-arrow"
                style={{ color: feature.color }}
              >
                <Icon name="arrow" size={16} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   WORKFLOW
   ========================================================= */

function WorkflowSection() {
  return (
    <section className="erx-section erx-workflow" id="workflow">
      <div className="erx-wrap">
        <div className="erx-section-intro erx-center">
          <span className="erx-eyebrow">
            Your new workflow
          </span>

          <h2>
            From patient to PDF
            <br />
            <span>in minutes.</span>
          </h2>

          <p>
            A natural workflow that feels familiar from the first
            prescription.
          </p>
        </div>

        <div className="erx-workflow-track">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <div
                className="erx-workflow-step"
                data-reveal
                style={{
                  transitionDelay: `${index * 90}ms`,
                }}
              >
                <div className="erx-step-circle">
                  <Icon name={step.icon} size={22} />
                </div>

                <span className="erx-step-number">
                  STEP {step.number}
                </span>

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </div>

              {index !== STEPS.length - 1 && (
                <div className="erx-workflow-connector">
                  <Icon name="arrow" size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="erx-workflow-preview">
          <div className="erx-pdf-window">
            <div className="erx-pdf-top">
              <div className="erx-window-dots">
                <i />
                <i />
                <i />
              </div>

              <span>
                Prescription Preview
              </span>

              <span className="erx-pdf-secure">
                <Icon name="lock" size={12} />
                Secure
              </span>
            </div>

            <div className="erx-pdf-body">
              <div className="erx-pdf-sidebar">
                <div className="erx-pdf-logo-small">
                  Ease<span>RX</span>
                </div>

                <span className="active">
                  <Icon name="document" size={14} />
                  Prescription
                </span>

                <span>
                  <Icon name="receipt" size={14} />
                  Invoice
                </span>

                <span>
                  <Icon name="users" size={14} />
                  Patient
                </span>
              </div>

              <div className="erx-pdf-paper">
                <div className="erx-paper-header">
                  <div>
                    <strong>DR. PRIYA SHARMA</strong>
                    <small>MBBS · MD</small>
                  </div>

                  <div>
                    <strong>EaseRX</strong>
                    <small>Professional</small>
                  </div>
                </div>

                <div className="erx-paper-line" />

                <div className="erx-paper-patient">
                  <div>
                    <small>PATIENT</small>
                    <strong>Aarav Shah</strong>
                  </div>

                  <div>
                    <small>AGE</small>
                    <strong>34 years</strong>
                  </div>

                  <div>
                    <small>DATE</small>
                    <strong>30 Aug 2026</strong>
                  </div>
                </div>

                <div className="erx-rx-heading">
                  <span>Rx</span>
                  <small>MEDICATION</small>
                </div>

                {[
                  ["01", "Amoxicillin 500mg", "1 capsule · 3 times daily"],
                  ["02", "Pantoprazole 40mg", "1 tablet · Before breakfast"],
                  ["03", "Paracetamol 650mg", "1 tablet · As required"],
                ].map((medicine) => (
                  <div
                    className="erx-medicine-row"
                    key={medicine[0]}
                  >
                    <span>{medicine[0]}</span>

                    <div>
                      <strong>{medicine[1]}</strong>
                      <small>{medicine[2]}</small>
                    </div>
                  </div>
                ))}

                <div className="erx-paper-footer">
                  <span>
                    Digitally generated with EaseRX
                  </span>

                  <div className="erx-signature">
                    <span>Priya</span>
                    <small>Dr. Priya Sharma</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ANALYTICS
   ========================================================= */

function AnalyticsSection() {
  return (
    <section className="erx-section erx-analytics">
      <div className="erx-wrap">
        <div className="erx-analytics-card">
          <div className="erx-analytics-copy">
            <span className="erx-eyebrow">
              See your practice clearly
            </span>

            <h2>
              Data that helps
              <br />
              <span>you grow.</span>
            </h2>

            <p>
              Turn daily clinical activity into useful insight.
              Understand your patient volume, prescriptions, revenue
              and trends without exporting spreadsheets.
            </p>

            <div className="erx-analytics-points">
              <div>
                <span>
                  <Icon name="chart" size={16} />
                </span>
                <strong>Live practice analytics</strong>
              </div>

              <div>
                <span>
                  <Icon name="calendar" size={16} />
                </span>
                <strong>Daily, weekly & monthly views</strong>
              </div>

              <div>
                <span>
                  <Icon name="database" size={16} />
                </span>
                <strong>One source of truth</strong>
              </div>
            </div>
          </div>

          <div className="erx-analytics-visual">
            <div className="erx-big-metric">
              <span>Monthly revenue</span>
              <strong>₹4,25,000</strong>
              <small>
                <Icon name="arrow" size={12} />
                18.4% this month
              </small>
            </div>

            <div className="erx-mini-chart">
              <div className="erx-mini-chart-header">
                <span>Patient visits</span>
                <strong>+24.8%</strong>
              </div>

              <div className="erx-bars">
                {[45, 62, 53, 78, 66, 91, 73, 98, 83, 100].map(
                  (height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>

              <div className="erx-bars-labels">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>

            <div className="erx-analytics-floating">
              <span>
                <Icon name="users" size={15} />
              </span>

              <div>
                <small>Active patients</small>
                <strong>1,248</strong>
              </div>

              <i>+12.8%</i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PRICING
   ========================================================= */

function PricingSection() {
  return (
    <section className="erx-section erx-pricing" id="pricing">
      <div className="erx-wrap">
        <div className="erx-section-intro erx-center">
          <span className="erx-eyebrow">
            Simple pricing
          </span>

          <h2>
            Start small.
            <br />
            <span>Grow without friction.</span>
          </h2>

          <p>
            Choose the plan that fits your practice today. Upgrade
            whenever you're ready.
          </p>
        </div>

        <div className="erx-pricing-grid">
          {PLANS.map((plan, index) => (
            <div
              className={`erx-price-card ${
                plan.popular ? "erx-price-popular" : ""
              }`}
              key={plan.name}
              data-reveal
              style={{
                transitionDelay: `${index * 80}ms`,
              }}
            >
              {plan.popular && (
                <div className="erx-popular-label">
                  MOST POPULAR
                </div>
              )}

              <div className="erx-price-top">
                <span>{plan.name}</span>

                {plan.popular ? (
                  <div className="erx-price-icon popular">
                    <Icon name="sparkles" size={17} />
                  </div>
                ) : (
                  <div className="erx-price-icon">
                    <Icon
                      name={
                        plan.name === "Basic"
                          ? "bolt"
                          : "shield"
                      }
                      size={17}
                    />
                  </div>
                )}
              </div>

              <div className="erx-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <p>{plan.tagline}</p>

              <div className="erx-price-divider" />

              <div className="erx-price-features">
                {plan.features.map((feature) => (
                  <div key={feature}>
                    <Icon name="checkCircle" size={16} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="/login"
                className={`erx-price-button ${
                  plan.popular ? "primary" : ""
                }`}
              >
                {plan.name === "Elite"
                  ? "Contact sales"
                  : "Get started"}
                <Icon name="arrow" size={15} />
              </a>
            </div>
          ))}
        </div>

        <div className="erx-pricing-note">
          <Icon name="shield" size={15} />
          No hidden fees · Cancel anytime
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TESTIMONIALS
   ========================================================= */

function TestimonialsSection() {
  return (
    <section className="erx-section erx-reviews" id="reviews">
      <div className="erx-wrap">
        <div className="erx-section-intro erx-center">
          <span className="erx-eyebrow">
            From the clinic
          </span>

          <h2>
            Doctors who switched
            <br />
            <span>aren't looking back.</span>
          </h2>

          <p>
            A better workflow should feel better to use.
          </p>
        </div>

        <div className="erx-review-grid">
          {TESTIMONIALS.map((testimonial, index) => (
            <article
              className="erx-review-card"
              key={testimonial.name}
              data-reveal
              style={{
                transitionDelay: `${index * 90}ms`,
              }}
            >
              <div className="erx-review-top">
                <span className="erx-review-stars">
                  ★★★★★
                </span>

                <Icon name="sparkles" size={16} />
              </div>

              <p>
                “{testimonial.quote}”
              </p>

              <div className="erx-review-person">
                <span>{testimonial.initials}</span>

                <div>
                  <strong>{testimonial.name}</strong>
                  <small>{testimonial.role}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CTA
   ========================================================= */

function FinalCTA() {
  return (
    <section className="erx-final">
      <div className="erx-final-grid" />

      <div className="erx-final-orb erx-final-orb-one" />
      <div className="erx-final-orb erx-final-orb-two" />

      <div className="erx-wrap">
        <div className="erx-final-inner">
          <span className="erx-final-icon">
           🦷
          </span>

          <h2>
            Your next prescription
            <br />
            <span>can be smarter.</span>
          </h2>

          <p>
            Join modern practitioners who are moving their daily
            workflow into one simple, connected workspace.
          </p>

          <div className="erx-final-buttons">
            <a
              href="/login"
              className="erx-btn erx-btn-white erx-btn-large"
            >
              Start for free
              <Icon name="arrow" size={17} />
            </a>

            <a
              href="/login"
              className="erx-btn erx-btn-outline-white erx-btn-large"
            >
              Talk to us
            </a>
          </div>

          <div className="erx-final-note">
            <Icon name="checkCircle" size={14} />
            No credit card required to get started
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer className="erx-footer">
      <div className="erx-wrap">
        <div className="erx-footer-main">
          <div className="erx-footer-brand">
            <Logo />

            <p>
              The intelligent prescription and practice management
              platform built for modern healthcare professionals.
            </p>

            <div className="erx-footer-secure">
              <Icon name="shield" size={14} />
              Built with clinical workflows in mind
            </div>
          </div>

          <div className="erx-footer-column">
            <strong>Product</strong>

            <a href="#features">Features</a>
            <a href="#workflow">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#reviews">Reviews</a>
          </div>

          <div className="erx-footer-column">
            <strong>Company</strong>

            <a href="#top">About EaseRX</a>
            <a href="#contact">Contact</a>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
          </div>

          <div className="erx-footer-column">
            <strong>Get started</strong>

            <a href="/login">Login</a>
            <a href="/login">Create account</a>
            <a href="mailto:hello@easerx.com">Email us</a>
          </div>
        </div>

        <div className="erx-footer-bottom">
          <span>
            © {new Date().getFullYear()} EaseRX. All rights reserved.
          </span>

          <span>
            Designed for modern medical practices.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   MAIN
   ========================================================= */

export default function Home() {
  useReveal();

  return (
    <div className="erx-home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');

        :root {
          --erx-primary: ${COLORS.primary};
          --erx-primary-2: ${COLORS.primaryContainer};
          --erx-secondary: ${COLORS.secondary};
          --erx-cyan: ${COLORS.cyan};

          --erx-bg: ${COLORS.bg};
          --erx-white: ${COLORS.surface};
          --erx-ink: ${COLORS.onBg};
          --erx-muted: ${COLORS.onVariant};
          --erx-line: ${COLORS.outline};

          --erx-radius: 24px;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--erx-bg);
          color: var(--erx-ink);
          font-family: "DM Sans", sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font: inherit;
        }

        .erx-home {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(45,188,254,0.035),
              transparent 30%
            ),
            var(--erx-bg);
        }

        .erx-home * {
          box-sizing: border-box;
        }

        .erx-wrap {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* =====================================================
           BUTTONS
           ===================================================== */

        .erx-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border-radius: 11px;
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 750;
          border: 1px solid transparent;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            background .25s ease,
            border-color .25s ease;
          cursor: pointer;
        }

        .erx-btn:hover {
          transform: translateY(-2px);
        }

        .erx-btn-small {
          padding: 11px 16px;
          font-size: 13px;
        }

        .erx-btn-large {
          min-height: 54px;
          padding: 0 23px;
          font-size: 16px;
        }

        .erx-btn-primary {
          background: var(--erx-primary);
          color: white;
          box-shadow:
            0 9px 24px rgba(19,35,89,.16);
        }

        .erx-btn-primary:hover {
          background: #0e1a46;
          box-shadow:
            0 14px 30px rgba(19,35,89,.22);
        }

        .erx-btn-light {
          background: white;
          color: var(--erx-primary);
          border-color: var(--erx-line);
        }

        .erx-btn-glass {
          background: rgba(255,255,255,.68);
          border-color: rgba(19,35,89,.12);
          color: var(--erx-primary);
          backdrop-filter: blur(12px);
        }

        .erx-btn-white {
          background: white;
          color: var(--erx-primary);
          box-shadow: 0 14px 35px rgba(0,0,0,.16);
        }

        .erx-btn-outline-white {
          color: white;
          border-color: rgba(255,255,255,.25);
          background: rgba(255,255,255,.06);
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .erx-header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 80px;
          background: rgba(245,248,252,.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(217,225,233,.8);
        }

        .erx-nav-wrap {
          width: min(1240px, calc(100% - 40px));
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .erx-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .erx-logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background:
            linear-gradient(
              145deg,
              var(--erx-primary),
              var(--erx-primary-2)
            );
          color: white;
          box-shadow:
            0 8px 20px rgba(19,35,89,.2);
        }

        .erx-logo-copy {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .erx-logo-copy strong {
          font-family: "Manrope", sans-serif;
          font-size: 20px;
          line-height: 1;
          letter-spacing: -.04em;
          color: var(--erx-primary);
        }

        .erx-logo-copy small {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .18em;
          color: var(--erx-muted);
        }

        .erx-nav {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .erx-nav > a {
          color: #606a77;
          font-size: 16px;
          font-weight: 650;
          transition: color .2s ease;
        }

        .erx-nav > a:hover {
          color: var(--erx-primary);
        }

        .erx-nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .erx-login {
          color: var(--erx-primary);
          font-size: 16px;
          font-weight: 700;
        }

        .erx-menu-button {
          display: none;
          border: 0;
          background: transparent;
          color: var(--erx-primary);
          padding: 6px;
          cursor: pointer;
        }

        .erx-mobile-nav-actions {
          display: none;
        }

        /* =====================================================
           HERO
           ===================================================== */

        .erx-hero {
          position: relative;
          min-height: 820px;
          padding: 90px 0 65px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background:
            radial-gradient(
              circle at 10% 15%,
              rgba(45,188,254,.11),
              transparent 27%
            ),
            radial-gradient(
              circle at 90% 30%,
              rgba(19,35,89,.08),
              transparent 32%
            );
        }

        .erx-hero-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .5;
          background-image:
            linear-gradient(
              rgba(19,35,89,.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(19,35,89,.025) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 75%
            );
        }

        .erx-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(1px);
        }

        .erx-orb-one {
          width: 14px;
          height: 14px;
          top: 25%;
          left: 7%;
          background: var(--erx-cyan);
          box-shadow: 0 0 0 10px rgba(45,188,254,.08);
          animation: erxFloat 5s ease-in-out infinite;
        }

        .erx-orb-two {
          width: 10px;
          height: 10px;
          right: 9%;
          top: 17%;
          background: var(--erx-primary);
          box-shadow: 0 0 0 9px rgba(19,35,89,.07);
          animation: erxFloat 6s ease-in-out infinite reverse;
        }

        @keyframes erxFloat {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        .erx-hero .erx-wrap {
          position: relative;
          z-index: 2;
        }

        .erx-hero-content {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }

        .erx-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px 8px 8px;
          border: 1px solid rgba(45,188,254,.24);
          border-radius: 999px;
          background: rgba(255,255,255,.72);
          color: var(--erx-secondary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .07em;
          text-transform: uppercase;
          box-shadow: 0 5px 20px rgba(19,35,89,.04);
        }

        .erx-hero-badge > span {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e1f6ff;
        }

        .erx-hero h1 {
          margin: 25px 0 22px;
          font-family: "Manrope", sans-serif;
          font-size: clamp(52px, 7vw, 88px);
          line-height: .98;
          letter-spacing: -.065em;
          font-weight: 800;
          color: var(--erx-primary);
        }

        .erx-hero h1 span {
          background:
            linear-gradient(
              95deg,
              var(--erx-secondary),
              var(--erx-cyan)
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .erx-hero-content > p {
          max-width: 640px;
          margin: 0 auto;
          color: #69737e;
          font-size: 18px;
          line-height: 1.75;
        }

        .erx-hero-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 32px;
        }

        .erx-play {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 8px;
          background: #e8edf5;
        }

        .erx-hero-trust {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 25px;
          text-align: left;
        }

        .erx-avatar-stack {
          display: flex;
          padding-left: 7px;
        }

        .erx-avatar-stack span {
          width: 30px;
          height: 30px;
          margin-left: -7px;
          border-radius: 50%;
          border: 2px solid var(--erx-bg);
          display: grid;
          place-items: center;
          background: var(--erx-primary);
          color: white;
          font-size: 9px;
          font-weight: 800;
        }

        .erx-avatar-stack span:nth-child(2) {
          background: var(--erx-secondary);
        }

        .erx-avatar-stack span:nth-child(3) {
          background: #7565e8;
        }

        .erx-avatar-stack span:last-child {
          background: white;
          color: var(--erx-primary);
          border-color: #dce4ed;
        }

        .erx-stars {
          color: #f3a33e;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .erx-hero-trust strong {
          display: block;
          margin-top: 3px;
          color: #66717d;
          font-size: 11px;
        }

        /* =====================================================
           DASHBOARD
           ===================================================== */

        .erx-dashboard-scene {
          position: relative;
          width: min(1020px, 100%);
          margin: 65px auto 0;
          min-height: 470px;
          perspective: 1300px;
        }

        .erx-dashboard-glow {
          position: absolute;
          width: 70%;
          height: 80%;
          left: 15%;
          top: 10%;
          background: rgba(45,188,254,.16);
          filter: blur(65px);
          border-radius: 50%;
        }

        .erx-dashboard {
          position: relative;
          z-index: 2;
          display: flex;
          width: 100%;
          min-height: 450px;
          background: rgba(255,255,255,.91);
          border: 1px solid rgba(197,209,222,.85);
          border-radius: 21px;
          overflow: hidden;
          box-shadow:
            0 35px 80px rgba(19,35,89,.15),
            0 5px 18px rgba(19,35,89,.07);
          transform:
            perspective(1500px)
            rotateX(1.4deg);
        }

        .erx-dashboard-sidebar {
          width: 62px;
          flex-shrink: 0;
          background:
            linear-gradient(
              180deg,
              #101e4c,
              #192b63
            );
          padding: 16px 10px;
        }

        .erx-mini-brand {
          display: flex;
          justify-content: center;
          padding-bottom: 22px;
        }

        .erx-mini-brand span {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.1);
          color: #9bdfff;
          border-radius: 9px;
        }

        .erx-sidebar-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .erx-sidebar-items div {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          color: #8092bf;
          border-radius: 9px;
        }

        .erx-sidebar-items div.active {
          background: rgba(45,188,254,.17);
          color: #8cdefe;
        }

        .erx-dashboard-main {
          flex: 1;
          min-width: 0;
          padding: 25px;
          background:
            linear-gradient(
              135deg,
              #f8fbfe,
              #f1f5fa
            );
        }

        .erx-dashboard-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .erx-dashboard-top > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .erx-dashboard-top span {
          color: #8a95a1;
          font-size: 10px;
        }

        .erx-dashboard-top strong {
          color: var(--erx-primary);
          font-size: 14px;
        }

        .erx-dashboard-avatar {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            linear-gradient(
              145deg,
              #d6eaff,
              #d8f5ff
            );
          color: var(--erx-primary);
          font-size: 10px;
          font-weight: 800;
        }

        .erx-dashboard-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 22px;
          margin-bottom: 14px;
        }

        .erx-dashboard-title h3 {
          margin: 0;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 17px;
          letter-spacing: -.03em;
        }

        .erx-dashboard-title span {
          color: #89949f;
          font-size: 10px;
        }

        .erx-dashboard-title button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          border: 0;
          border-radius: 8px;
          background: var(--erx-primary);
          color: white;
          font-size: 10px;
          font-weight: 700;
        }

        .erx-stat-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
        }

        .erx-dashboard-stat {
          position: relative;
          padding: 14px;
          background: white;
          border: 1px solid #e5ebf1;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(19,35,89,.035);
        }

        .erx-dashboard-stat .stat-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          margin-bottom: 9px;
        }

        .stat-icon.blue {
          background: #e8ecff;
          color: var(--erx-primary);
        }

        .stat-icon.cyan {
          background: #e0f7ff;
          color: var(--erx-secondary);
        }

        .stat-icon.purple {
          background: #eeeaff;
          color: #7565e8;
        }

        .erx-dashboard-stat > span {
          display: block;
          color: #8a95a0;
          font-size: 9px;
        }

        .erx-dashboard-stat > strong {
          display: inline-block;
          margin-top: 4px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 19px;
        }

        .erx-dashboard-stat > small {
          float: right;
          margin-top: 9px;
          color: #15a36f;
          font-size: 9px;
          font-weight: 800;
        }

        .erx-dashboard-content {
          display: grid;
          grid-template-columns: 1.6fr .8fr;
          gap: 10px;
          margin-top: 10px;
        }

        .erx-chart-card,
        .erx-recent-card {
          padding: 14px;
          background: white;
          border: 1px solid #e5ebf1;
          border-radius: 12px;
        }

        .erx-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .erx-chart-header div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .erx-chart-header span {
          color: #89949f;
          font-size: 9px;
        }

        .erx-chart-header strong {
          color: var(--erx-primary);
          font-size: 15px;
        }

        .erx-chart-period {
          padding: 6px 8px;
          border: 1px solid #e6ebf1;
          border-radius: 6px;
          color: #78838f !important;
          font-size: 8px !important;
        }

        .erx-chart {
          position: relative;
          height: 170px;
          margin-top: 8px;
        }

        .erx-chart-lines {
          position: absolute;
          inset: 10px 0 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .erx-chart-lines i {
          display: block;
          width: 100%;
          border-top: 1px dashed #edf0f4;
        }

        .erx-chart svg {
          position: absolute;
          inset: 10px 0 28px;
          width: 100%;
          height: calc(100% - 38px);
          overflow: visible;
        }

        .erx-chart-area {
          fill: url(#chartArea);
        }

        .erx-chart-line {
          fill: none;
          stroke: var(--erx-cyan);
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 1000;
          animation: erxDrawChart 3s ease forwards;
        }

        @keyframes erxDrawChart {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .erx-chart-point {
          fill: white;
          stroke: var(--erx-cyan);
          stroke-width: 3;
        }

        .erx-chart-months {
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
        }

        .erx-chart-months span {
          color: #9ba5af;
          font-size: 8px;
        }

        .erx-recent-head {
          display: flex;
          justify-content: space-between;
          color: var(--erx-primary);
          font-size: 10px;
          font-weight: 750;
          padding-bottom: 10px;
          border-bottom: 1px solid #edf0f4;
        }

        .erx-recent-head svg {
          color: var(--erx-secondary);
        }

        .erx-patient {
          display: grid;
          grid-template-columns: 30px 1fr 13px;
          gap: 7px;
          align-items: center;
          padding: 11px 0;
          border-bottom: 1px solid #f0f2f5;
        }

        .erx-patient > span {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          background: #edf3ff;
          color: var(--erx-primary);
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
        }

        .erx-patient div {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .erx-patient strong {
          color: var(--erx-primary);
          font-size: 10px;
        }

        .erx-patient small {
          color: #9aa4ae;
          font-size: 8px;
        }

        .erx-patient > svg {
          color: #a7b1bb;
        }

        .erx-floating-card {
          position: absolute;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(217,225,233,.9);
          border-radius: 13px;
          box-shadow: 0 18px 40px rgba(19,35,89,.13);
          animation: erxCardFloat 5s ease-in-out infinite;
        }

        @keyframes erxCardFloat {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .erx-floating-card--top {
          top: 45px;
          right: -20px;
        }

        .erx-floating-card--bottom {
          bottom: 20px;
          left: -20px;
          animation-delay: -2s;
        }

        .floating-icon {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #e2f8ef;
          color: #18a873;
        }

        .floating-icon.cyan {
          background: #e0f7ff;
          color: var(--erx-secondary);
        }

        .erx-floating-card div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .erx-floating-card strong {
          color: var(--erx-primary);
          font-size: 10px;
        }

        .erx-floating-card small {
          color: #8d98a3;
          font-size: 8px;
        }

        .erx-scroll-indicator {
          position: absolute;
          bottom: 23px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 11px;
          color: #99a4ae;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .erx-scroll-indicator i {
          width: 38px;
          height: 1px;
          background: #ccd6df;
        }

        /* =====================================================
           TRUST
           ===================================================== */

        .erx-trust-strip {
          border-top: 1px solid #e3e9ef;
          border-bottom: 1px solid #e3e9ef;
          background: rgba(255,255,255,.65);
        }

        .erx-trust-strip .erx-wrap {
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .erx-trust-label {
          color: #8b96a1;
          font-size: 18px;
          white-space: nowrap;
        }

        .erx-trust-items {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
          gap: 25px;
        }

        .erx-trust-items span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #82909c;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: .07em;
          white-space: nowrap;
        }

        .erx-trust-items svg {
          color: var(--erx-secondary);
        }

        /* =====================================================
           SECTIONS
           ===================================================== */

        .erx-section {
          padding: 120px 0;
          position: relative;
        }

        .erx-section-intro {
          max-width: 700px;
          margin-bottom: 60px;
        }

        .erx-center {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }

        .erx-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 999px;
          background: #e5f5fc;
          color: var(--erx-secondary);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .erx-eyebrow-red {
          color: #a04e5b;
          background: #ffe8eb;
        }

        .erx-section-intro h2 {
          margin: 19px 0 16px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: clamp(42px, 5.5vw, 62px);
          line-height: 1.02;
          letter-spacing: -.055em;
        }

        .erx-section-intro h2 span {
          color: var(--erx-secondary);
        }

        .erx-section-intro > p {
          max-width: 570px;
          margin: 0 auto;
          color: #6d7782;
          font-size: 16px;
          line-height: 1.75;
        }

        /* =====================================================
           PROBLEM
           ===================================================== */

        .erx-problem {
          background: white;
        }

        .erx-problem-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
        }

        .erx-problem-card {
          display: flex;
          gap: 14px;
          padding: 23px;
          border: 1px solid #e6ebf0;
          border-radius: 17px;
          background: #fff;
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .erx-problem-card:hover {
          transform: translateY(-5px);
          border-color: #ffd0d6;
          box-shadow: 0 15px 35px rgba(19,35,89,.07);
        }

        .erx-problem-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #ffeaed;
          color: #bf5362;
        }

        .erx-problem-card h3 {
          margin: 0 0 8px;
          color: var(--erx-primary);
          font-size: 18px;
          letter-spacing: -.02em;
        }

        .erx-problem-card p {
          margin: 0;
          color: #78838e;
          font-size: 15px;
          line-height: 1.65;
        }

        .erx-problem-bottom {
          display: flex;
          align-items: center;
          gap: 15px;
          justify-content: center;
          margin-top: 48px;
          color: #9aa4ad;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .erx-problem-line {
          width: 80px;
          height: 1px;
          background: #e0e6eb;
        }

        /* =====================================================
           SOLUTION
           ===================================================== */

        .erx-solution {
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #eef5fb,
              #f8fbfd
            );
        }

        .erx-solution-bg {
          position: absolute;
          width: 700px;
          height: 700px;
          right: -250px;
          top: -200px;
          border-radius: 50%;
          background: rgba(45,188,254,.08);
          filter: blur(40px);
        }

        .erx-solution-grid {
          display: grid;
          grid-template-columns: .85fr 1.15fr;
          gap: 90px;
          align-items: center;
          position: relative;
        }

        .erx-solution-copy h2 {
          margin: 20px 0 20px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: clamp(42px, 4.8vw, 62px);
          line-height: 1;
          letter-spacing: -.055em;
        }

        .erx-solution-copy h2 span {
          color: var(--erx-secondary);
        }

        .erx-solution-copy > p {
          max-width: 500px;
          margin: 0;
          color: #6f7b87;
          font-size: 15px;
          line-height: 1.8;
        }

        .erx-solution-checks {
          margin-top: 26px;
          display: grid;
          gap: 12px;
        }

        .erx-solution-checks div {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #53606d;
          font-size: 13px;
          font-weight: 650;
        }

        .erx-solution-checks span {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #dff7ee;
          color: #159b6a;
        }

        .erx-text-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 29px;
          color: var(--erx-primary);
          font-size: 13px;
          font-weight: 800;
        }

        .erx-text-button svg {
          transition: transform .2s ease;
        }

        .erx-text-button:hover svg {
          transform: translateX(5px);
        }

        .erx-flow-visual {
          position: relative;
          min-height: 490px;
        }

        .erx-flow-card {
          position: absolute;
          background: rgba(255,255,255,.94);
          border: 1px solid #dce5ed;
          border-radius: 19px;
          box-shadow: 0 24px 55px rgba(19,35,89,.11);
        }

        .erx-flow-card-main {
          width: 380px;
          left: 40px;
          top: 40px;
          padding: 23px;
        }

        .erx-flow-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .erx-flow-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }

        .erx-flow-icon.blue {
          background: #e7ebff;
          color: var(--erx-primary);
        }

        .erx-flow-icon.purple {
          background: #eeeaff;
          color: var(--erx-purple);
        }

        .erx-flow-icon.cyan {
          background: #e1f7ff;
          color: var(--erx-secondary);
        }

        .erx-flow-status {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #16a16c;
          font-size: 9px;
          font-weight: 850;
        }

        .erx-flow-status i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #20b77e;
        }

        .erx-flow-card-main > small {
          display: block;
          margin-top: 28px;
          color: #94a0aa;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
        }

        .erx-flow-card-main > strong {
          display: block;
          margin-top: 6px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 20px;
        }

        .erx-rx-lines {
          display: grid;
          gap: 8px;
          margin-top: 25px;
        }

        .erx-rx-lines span {
          display: block;
          height: 8px;
          border-radius: 5px;
          background: #edf2f6;
        }

        .erx-rx-lines span:first-child {
          width: 88%;
          background: #e1eaf5;
        }

        .erx-rx-lines span:nth-child(2) {
          width: 66%;
        }

        .erx-rx-lines span:last-child {
          width: 76%;
        }

        .erx-flow-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
          padding-top: 14px;
          border-top: 1px solid #edf0f3;
          color: #95a0aa;
          font-size: 9px;
        }

        .erx-flow-footer span:first-child {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #18a873;
          font-weight: 700;
        }

        .erx-flow-card-billing {
          width: 280px;
          right: 5px;
          top: 225px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .erx-flow-card-billing div,
        .erx-flow-card-share div {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }

        .erx-flow-card-billing small,
        .erx-flow-card-share small {
          color: #9aa5af;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .erx-flow-card-billing strong,
        .erx-flow-card-share strong {
          color: var(--erx-primary);
          font-size: 13px;
        }

        .erx-flow-card-billing > svg {
          color: #19a874;
        }

        .erx-flow-card-share {
          width: 330px;
          right: 50px;
          bottom: 25px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .erx-share-arrow {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #edf5ff;
          color: var(--erx-secondary);
        }

        .erx-flow-connector {
          position: absolute;
          border: 1px dashed #a6dff2;
          border-left: 0;
          border-bottom: 0;
          border-radius: 0 20px 0 0;
        }

        .connector-one {
          width: 75px;
          height: 55px;
          top: 190px;
          right: 210px;
          transform: rotate(15deg);
        }

        .connector-two {
          width: 55px;
          height: 65px;
          right: 190px;
          bottom: 105px;
          transform: rotate(-15deg);
        }

        /* =====================================================
           FEATURES
           ===================================================== */

        .erx-features {
          background: white;
        }

        .erx-feature-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 14px;
        }

        .erx-feature-card {
          min-height: 245px;
          position: relative;
          padding: 23px;
          border: 1px solid #e4eaf0;
          border-radius: 18px;
          background: white;
          overflow: hidden;
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .erx-feature-card::after {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          right: -70px;
          bottom: -70px;
          border-radius: 50%;
          background: rgba(45,188,254,.05);
          transition: transform .4s ease;
        }

        .erx-feature-card:hover {
          transform: translateY(-7px);
          border-color: #ccdce9;
          box-shadow: 0 20px 45px rgba(19,35,89,.08);
        }

        .erx-feature-card:hover::after {
          transform: scale(1.5);
        }

        .erx-feature-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 12px;
        }

        .erx-feature-number {
          position: absolute;
          right: 22px;
          top: 24px;
          color: #aab4be;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .erx-feature-card h3 {
          margin: 25px 0 9px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 18px;
          letter-spacing: -.03em;
        }

        .erx-feature-card p {
          margin: 0;
          color: #75818c;
          font-size: 13px;
          line-height: 1.7;
        }

        .erx-feature-arrow {
          position: absolute;
          right: 21px;
          bottom: 20px;
          z-index: 2;
        }

        /* =====================================================
           WORKFLOW
           ===================================================== */

        .erx-workflow {
          background: #f0f5fa;
        }

        .erx-workflow-track {
          display: grid;
          grid-template-columns: 1fr 50px 1fr 50px 1fr 50px 1fr;
          align-items: start;
        }

        .erx-workflow-step {
          text-align: center;
        }

        .erx-step-circle {
          width: 60px;
          height: 60px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: white;
          color: var(--erx-primary);
          border: 1px solid #dce5ec;
          box-shadow: 0 8px 22px rgba(19,35,89,.06);
          transition: .3s ease;
        }

        .erx-workflow-step:hover .erx-step-circle {
          background: var(--erx-primary);
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(19,35,89,.15);
        }

        .erx-step-number {
          color: var(--erx-secondary);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .13em;
        }

        .erx-workflow-step h3 {
          margin: 7px 0 7px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 16px;
        }

        .erx-workflow-step p {
          max-width: 190px;
          margin: 0 auto;
          color: #77838e;
          font-size: 12px;
          line-height: 1.65;
        }

        .erx-workflow-connector {
          height: 60px;
          display: grid;
          place-items: center;
          color: #8dbbd0;
        }

        .erx-workflow-preview {
          margin-top: 70px;
        }

        .erx-pdf-window {
          max-width: 960px;
          min-height: 520px;
          margin: 0 auto;
          background: white;
          border: 1px solid #dce4ec;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 28px 65px rgba(19,35,89,.12);
        }

        .erx-pdf-top {
          height: 50px;
          padding: 0 17px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          background: #f9fbfd;
          border-bottom: 1px solid #e5eaf0;
        }

        .erx-window-dots {
          display: flex;
          gap: 5px;
        }

        .erx-window-dots i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d6dde5;
        }

        .erx-pdf-top > span:nth-child(2) {
          text-align: center;
          color: #7d8995;
          font-size: 10px;
          font-weight: 700;
        }

        .erx-pdf-secure {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #18a873;
          font-size: 9px !important;
        }

        .erx-pdf-body {
          display: grid;
          grid-template-columns: 170px 1fr;
          min-height: 470px;
        }

        .erx-pdf-sidebar {
          padding: 22px 14px;
          background: #f6f9fc;
          border-right: 1px solid #e6ebf0;
        }

        .erx-pdf-logo-small {
          padding: 10px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .erx-pdf-logo-small span {
          color: var(--erx-secondary);
        }

        .erx-pdf-sidebar > span {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px;
          margin-bottom: 5px;
          color: #82909c;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 650;
        }

        .erx-pdf-sidebar > span.active {
          color: var(--erx-primary);
          background: #e8edf8;
          font-weight: 800;
        }

        .erx-pdf-paper {
          width: min(580px, calc(100% - 50px));
          min-height: 420px;
          margin: 25px auto;
          padding: 30px;
          background: white;
          border: 1px solid #e3e8ed;
          box-shadow: 0 15px 35px rgba(19,35,89,.07);
        }

        .erx-paper-header {
          display: flex;
          justify-content: space-between;
        }

        .erx-paper-header div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .erx-paper-header strong {
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 15px;
        }

        .erx-paper-header small {
          color: #89949f;
          font-size: 9px;
        }

        .erx-paper-header div:last-child {
          text-align: right;
        }

        .erx-paper-header div:last-child strong {
          color: var(--erx-secondary);
          font-size: 19px;
        }

        .erx-paper-line {
          height: 2px;
          margin: 20px 0;
          background:
            linear-gradient(
              90deg,
              var(--erx-primary),
              var(--erx-cyan)
            );
        }

        .erx-paper-patient {
          display: grid;
          grid-template-columns: 1.5fr .7fr 1fr;
          gap: 20px;
        }

        .erx-paper-patient div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .erx-paper-patient small,
        .erx-rx-heading small {
          color: #9aa4ad;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .erx-paper-patient strong {
          color: var(--erx-primary);
          font-size: 11px;
        }

        .erx-rx-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 28px 0 10px;
        }

        .erx-rx-heading > span {
          color: var(--erx-secondary);
          font-family: Georgia, serif;
          font-size: 26px;
          font-style: italic;
        }

        .erx-medicine-row {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #edf0f3;
        }

        .erx-medicine-row > span {
          color: #a4aeb7;
          font-size: 9px;
        }

        .erx-medicine-row div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .erx-medicine-row strong {
          color: var(--erx-primary);
          font-size: 11px;
        }

        .erx-medicine-row small {
          color: #8a96a1;
          font-size: 9px;
        }

        .erx-paper-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #e9edf1;
        }

        .erx-paper-footer > span {
          color: #a1abb4;
          font-size: 8px;
        }

        .erx-signature {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }

        .erx-signature span {
          color: var(--erx-primary);
          font-family: "Brush Script MT", cursive;
          font-size: 24px;
        }

        .erx-signature small {
          color: #88949f;
          font-size: 8px;
        }

        /* =====================================================
           ANALYTICS
           ===================================================== */

        .erx-analytics {
          background: white;
        }

        .erx-analytics-card {
          position: relative;
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          gap: 65px;
          padding: 65px;
          border-radius: 30px;
          background:
            linear-gradient(
              135deg,
              #edf5fb,
              #f8fbfd
            );
          border: 1px solid #dce7ef;
          overflow: hidden;
        }

        .erx-analytics-card::after {
          content: "";
          position: absolute;
          width: 400px;
          height: 400px;
          right: -170px;
          bottom: -230px;
          border-radius: 50%;
          border: 1px solid rgba(45,188,254,.13);
          box-shadow:
            0 0 0 60px rgba(45,188,254,.025),
            0 0 0 120px rgba(45,188,254,.02);
        }

        .erx-analytics-copy h2 {
          margin: 19px 0;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: clamp(42px,4.8vw,60px);
          line-height: 1;
          letter-spacing: -.055em;
        }

        .erx-analytics-copy h2 span {
          color: var(--erx-secondary);
        }

        .erx-analytics-copy > p {
          max-width: 440px;
          color: #71808d;
          font-size: 15px;
          line-height: 1.8;
        }

        .erx-analytics-points {
          display: grid;
          gap: 12px;
          margin-top: 25px;
        }

        .erx-analytics-points div {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #53616d;
          font-size: 12px;
        }

        .erx-analytics-points span {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: white;
          color: var(--erx-secondary);
          box-shadow: 0 5px 15px rgba(19,35,89,.06);
        }

        .erx-analytics-visual {
          position: relative;
          min-height: 350px;
        }

        .erx-big-metric {
          position: absolute;
          width: 250px;
          left: 15px;
          top: 20px;
          padding: 20px;
          background: white;
          border: 1px solid #dce6ed;
          border-radius: 17px;
          box-shadow: 0 18px 45px rgba(19,35,89,.09);
          z-index: 3;
        }

        .erx-big-metric span {
          display: block;
          color: #8b97a2;
          font-size: 10px;
        }

        .erx-big-metric strong {
          display: block;
          margin-top: 6px;
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 28px;
          letter-spacing: -.04em;
        }

        .erx-big-metric small {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 7px;
          color: #17a873;
          font-size: 9px;
          font-weight: 800;
        }

        .erx-mini-chart {
          position: absolute;
          width: 380px;
          right: 0;
          bottom: 0;
          padding: 22px;
          background: white;
          border: 1px solid #dce6ed;
          border-radius: 18px;
          box-shadow: 0 22px 50px rgba(19,35,89,.1);
        }

        .erx-mini-chart-header {
          display: flex;
          justify-content: space-between;
        }

        .erx-mini-chart-header span {
          color: #798591;
          font-size: 10px;
        }

        .erx-mini-chart-header strong {
          color: #18a873;
          font-size: 10px;
        }

        .erx-bars {
          height: 145px;
          display: flex;
          align-items: flex-end;
          gap: 11px;
          padding: 15px 5px 0;
          border-bottom: 1px solid #edf1f4;
        }

        .erx-bars span {
          flex: 1;
          min-width: 8px;
          max-width: 25px;
          border-radius: 5px 5px 0 0;
          background:
            linear-gradient(
              to top,
              var(--erx-secondary),
              var(--erx-cyan)
            );
          opacity: .78;
          animation: erxBarGrow 1s ease backwards;
        }

        .erx-bars span:nth-child(2) { animation-delay: .05s; }
        .erx-bars span:nth-child(3) { animation-delay: .1s; }
        .erx-bars span:nth-child(4) { animation-delay: .15s; }
        .erx-bars span:nth-child(5) { animation-delay: .2s; }
        .erx-bars span:nth-child(6) { animation-delay: .25s; }
        .erx-bars span:nth-child(7) { animation-delay: .3s; }
        .erx-bars span:nth-child(8) { animation-delay: .35s; }
        .erx-bars span:nth-child(9) { animation-delay: .4s; }
        .erx-bars span:nth-child(10) { animation-delay: .45s; }

        @keyframes erxBarGrow {
          from {
            height: 0 !important;
          }
        }

        .erx-bars-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 9px;
          color: #a0aab3;
          font-size: 8px;
        }

        .erx-analytics-floating {
          position: absolute;
          right: 45px;
          top: 45px;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--erx-primary);
          color: white;
          border-radius: 12px;
          box-shadow: 0 15px 30px rgba(19,35,89,.22);
        }

        .erx-analytics-floating > span {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255,255,255,.12);
          color: #94defc;
        }

        .erx-analytics-floating div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .erx-analytics-floating small {
          color: #91a0c0;
          font-size: 8px;
        }

        .erx-analytics-floating strong {
          font-size: 14px;
        }

        .erx-analytics-floating > i {
          color: #84ddb3;
          font-size: 9px;
          font-style: normal;
          font-weight: 800;
        }

        /* =====================================================
           PRICING
           ===================================================== */

        .erx-pricing {
          background: #f5f8fb;
        }

        .erx-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 16px;
          align-items: stretch;
        }

        .erx-price-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 32px;
          background: white;
          border: 1px solid #e0e7ed;
          border-radius: 21px;
          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .erx-price-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 22px 50px rgba(19,35,89,.09);
        }

        .erx-price-popular {
          border: 1.5px solid var(--erx-primary);
          box-shadow: 0 18px 45px rgba(19,35,89,.1);
        }

        .erx-popular-label {
          position: absolute;
          top: -11px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 14px;
          border-radius: 999px;
          background: var(--erx-primary);
          color: white;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .erx-price-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .erx-price-top > span {
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 21px;
          font-weight: 800;
        }

        .erx-price-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #edf2f7;
          color: var(--erx-primary);
        }

        .erx-price-icon.popular {
          color: var(--erx-cyan);
          background: #e6f7ff;
        }

        .erx-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 25px;
        }

        .erx-price strong {
          color: var(--erx-primary);
          font-family: "Manrope", sans-serif;
          font-size: 40px;
          letter-spacing: -.05em;
        }

        .erx-price span {
          color: #8c97a2;
          font-size: 11px;
        }

        .erx-price-card > p {
          min-height: 40px;
          margin: 12px 0 0;
          color: #7a8691;
          font-size: 12px;
          line-height: 1.6;
        }

        .erx-price-divider {
          height: 1px;
          margin: 24px 0;
          background: #e9edf1;
        }

        .erx-price-features {
          flex: 1;
          display: grid;
          gap: 12px;
        }

        .erx-price-features div {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          color: #596671;
          font-size: 12px;
        }

        .erx-price-features svg {
          min-width: 16px;
          color: var(--erx-secondary);
        }

        .erx-price-button {
          min-height: 46px;
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #d9e1e8;
          border-radius: 10px;
          color: var(--erx-primary);
          font-size: 12px;
          font-weight: 800;
          transition: .25s ease;
        }

        .erx-price-button:hover {
          border-color: var(--erx-primary);
        }

        .erx-price-button.primary {
          background: var(--erx-primary);
          border-color: var(--erx-primary);
          color: white;
          box-shadow: 0 9px 22px rgba(19,35,89,.15);
        }

        .erx-pricing-note {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 25px;
          color: #89949e;
          font-size: 12px;
        }

        .erx-pricing-note svg {
          color: #19a875;
        }

        /* =====================================================
           REVIEWS
           ===================================================== */

        .erx-reviews {
          background: white;
        }

        .erx-review-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 16px;
        }

        .erx-review-card {
          padding: 28px;
          border: 1px solid #e3e9ef;
          border-radius: 19px;
          background: white;
          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .erx-review-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(19,35,89,.08);
        }

        .erx-review-top {
          display: flex;
          justify-content: space-between;
        }

        .erx-review-stars {
          color: #f2a13c;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .erx-review-top > svg {
          color: #b5c0cb;
        }

        .erx-review-card > p {
          min-height: 115px;
          margin: 23px 0;
          color: #4f5d69;
          font-family: "Manrope", sans-serif;
          font-size: 16px;
          line-height: 1.7;
          letter-spacing: -.02em;
        }

        .erx-review-person {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 18px;
          border-top: 1px solid #edf0f3;
        }

        .erx-review-person > span {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e8edfa;
          color: var(--erx-primary);
          font-size: 10px;
          font-weight: 850;
        }

        .erx-review-person div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .erx-review-person strong {
          color: var(--erx-primary);
          font-size: 12px;
        }

        .erx-review-person small {
          color: #8b97a1;
          font-size: 10px;
        }

        /* =====================================================
           CTA
           ===================================================== */

        .erx-final {
          position: relative;
          padding: 120px 0;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 40%,
              #29427c,
              #0c1739 70%
            );
          color: white;
        }

        .erx-final-grid {
          position: absolute;
          inset: 0;
          opacity: .13;
          background-image:
            linear-gradient(
              rgba(255,255,255,.35) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.35) 1px,
              transparent 1px
            );
          background-size: 65px 65px;
          mask-image:
            radial-gradient(
              circle,
              black,
              transparent 75%
            );
        }

        .erx-final-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
        }

        .erx-final-orb-one {
          width: 350px;
          height: 350px;
          left: -150px;
          top: -100px;
          border: 1px solid rgba(45,188,254,.25);
          box-shadow:
            0 0 0 60px rgba(45,188,254,.035),
            0 0 0 120px rgba(45,188,254,.025);
        }

        .erx-final-orb-two {
          width: 250px;
          height: 250px;
          right: -100px;
          bottom: -120px;
          border: 1px solid rgba(255,255,255,.1);
        }

        .erx-final-inner {
          position: relative;
          z-index: 2;
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }

        .erx-final-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #8bdcff;
          background: rgba(45,188,254,.1);
          border: 1px solid rgba(45,188,254,.18);
          box-shadow: 0 0 40px rgba(45,188,254,.12);
        }

        .erx-final h2 {
          margin: 25px 0 18px;
          font-family: "Manrope", sans-serif;
          font-size: clamp(48px,6.5vw,72px);
          line-height: .99;
          letter-spacing: -.06em;
        }

        .erx-final h2 span {
          color: #6ed3fa;
        }

        .erx-final p {
          max-width: 570px;
          margin: 0 auto;
          color: #9ba9c5;
          font-size: 16px;
          line-height: 1.75;
        }

        .erx-final-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 31px;
        }

        .erx-final-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 18px;
          color: #7181a5;
          font-size: 10px;
        }

        .erx-final-note svg {
          color: #74d9aa;
        }

        /* =====================================================
           FOOTER
           ===================================================== */

        .erx-footer {
          padding: 70px 0 25px;
          background: #07122f;
          color: white;
        }

        .erx-footer-main {
          display: grid;
          grid-template-columns: 1.7fr repeat(3,.7fr);
          gap: 70px;
          padding-bottom: 55px;
          border-bottom: 1px solid rgba(255,255,255,.09);
        }

        .erx-footer .erx-logo-copy strong {
          color: white;
        }

        .erx-footer .erx-logo-copy small {
          color: #7281a1;
        }

        .erx-footer-brand p {
          max-width: 330px;
          margin: 20px 0;
          color: #7484a4;
          font-size: 14px;
          line-height: 1.8;
        }

        .erx-footer-secure {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #7190a7;
          font-size: 14px;
        }

        .erx-footer-secure svg {
          color: #72d9aa;
        }

        .erx-footer-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .erx-footer-column > strong {
          margin-bottom: 5px;
          color: white;
          font-size: 13px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .erx-footer-column a {
          color: #7585a4;
          font-size: 12px;
          transition: color .2s ease;
        }

        .erx-footer-column a:hover {
          color: #91ddfb;
        }

        .erx-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 21px;
          color: #536481;
          font-size: 12px;
        }

        /* =====================================================
           REVEAL
           ===================================================== */

        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity .7s ease,
            transform .7s cubic-bezier(.2,.7,.2,1);
        }

        [data-reveal].erx-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 1050px) {
          .erx-wrap {
            width: min(100% - 36px, 950px);
          }

          .erx-dashboard-scene {
            width: 96%;
          }

          .erx-floating-card--top {
            right: -5px;
          }

          .erx-floating-card--bottom {
            left: -5px;
          }

          .erx-solution-grid {
            gap: 45px;
          }

          .erx-feature-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .erx-footer-main {
            gap: 40px;
          }
        }

        @media (max-width: 820px) {
          .erx-nav {
            position: absolute;
            left: 0;
            right: 0;
            top: 80px;
            display: none;
            padding: 18px;
            background: rgba(248,250,252,.98);
            border-bottom: 1px solid var(--erx-line);
            box-shadow: 0 20px 35px rgba(19,35,89,.08);
            flex-direction: column;
            align-items: stretch;
            gap: 0;
          }

          .erx-nav.erx-nav-open {
            display: flex;
          }

          .erx-nav > a {
            padding: 14px 10px;
            border-bottom: 1px solid #e7ebef;
          }

          .erx-mobile-nav-actions {
            display: flex;
            gap: 9px;
            padding-top: 15px;
          }

          .erx-mobile-nav-actions a {
            flex: 1;
          }

          .erx-nav-actions .erx-login,
          .erx-nav-actions .erx-btn {
            display: none;
          }

          .erx-menu-button {
            display: block;
          }

          .erx-hero {
            padding-top: 65px;
            min-height: auto;
          }

          .erx-dashboard {
            min-height: 410px;
          }

          .erx-dashboard-main {
            padding: 18px;
          }

          .erx-trust-strip .erx-wrap {
            flex-direction: column;
            padding: 22px 0;
            align-items: flex-start;
          }

          .erx-trust-items {
            width: 100%;
            flex-wrap: wrap;
          }

          .erx-problem-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .erx-solution-grid,
          .erx-analytics-card {
            grid-template-columns: 1fr;
          }

          .erx-flow-visual {
            max-width: 620px;
            margin: 0 auto;
            width: 100%;
          }

          .erx-workflow-track {
            grid-template-columns: 1fr 35px 1fr;
            row-gap: 35px;
          }

          .erx-workflow-connector:nth-of-type(4) {
            display: none;
          }

          .erx-workflow-connector:nth-of-type(2) {
            display: none;
          }

          .erx-workflow-step:nth-of-type(3),
          .erx-workflow-step:nth-of-type(4) {
            grid-row: 2;
          }

          .erx-pdf-body {
            grid-template-columns: 120px 1fr;
          }

          .erx-analytics-card {
            padding: 45px;
          }

          .erx-footer-main {
            grid-template-columns: 1.5fr 1fr 1fr;
          }

          .erx-footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .erx-wrap {
            width: min(100% - 28px, 100%);
          }

          .erx-header {
            height: 68px;
          }

          .erx-nav {
            top: 68px;
          }

          .erx-hero {
            padding: 55px 0 35px;
          }

          .erx-hero h1 {
            font-size: 52px;
          }

          .erx-hero-content > p {
            font-size: 15px;
          }

          .erx-hero-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .erx-hero-buttons .erx-btn {
            width: 100%;
          }

          .erx-hero-trust {
            transform: scale(.9);
          }

          .erx-dashboard-scene {
            width: 100%;
            min-height: 300px;
            margin-top: 45px;
          }

          .erx-dashboard {
            min-height: 300px;
            border-radius: 15px;
          }

          .erx-dashboard-sidebar {
            width: 43px;
            padding: 10px 6px;
          }

          .erx-mini-brand span {
            width: 29px;
            height: 29px;
          }

          .erx-sidebar-items div {
            width: 31px;
            height: 31px;
          }

          .erx-dashboard-main {
            padding: 11px;
          }

          .erx-dashboard-top strong {
            font-size: 11px;
          }

          .erx-dashboard-title {
            margin-top: 12px;
          }

          .erx-dashboard-title h3 {
            font-size: 13px;
          }

          .erx-dashboard-title button {
            font-size: 8px;
            padding: 7px 8px;
          }

          .erx-stat-grid {
            gap: 5px;
          }

          .erx-dashboard-stat {
            padding: 8px;
          }

          .erx-dashboard-stat .stat-icon {
            width: 23px;
            height: 23px;
            margin-bottom: 5px;
          }

          .erx-dashboard-stat > strong {
            font-size: 13px;
          }

          .erx-dashboard-content {
            grid-template-columns: 1fr;
          }

          .erx-chart-card {
            min-height: 140px;
          }

          .erx-chart {
            height: 105px;
          }

          .erx-recent-card {
            display: none;
          }

          .erx-floating-card {
            transform: scale(.75);
          }

          .erx-floating-card--top {
            top: 5px;
            right: -28px;
          }

          .erx-floating-card--bottom {
            bottom: -20px;
            left: -28px;
          }

          .erx-scroll-indicator {
            display: none;
          }

          .erx-trust-items {
            gap: 14px;
          }

          .erx-trust-items span {
            font-size: 8px;
          }

          .erx-section {
            padding: 80px 0;
          }

          .erx-section-intro {
            margin-bottom: 42px;
          }

          .erx-section-intro h2 {
            font-size: 44px;
          }

          .erx-problem-grid,
          .erx-feature-grid,
          .erx-pricing-grid,
          .erx-review-grid {
            grid-template-columns: 1fr;
          }

          .erx-problem-card {
            padding: 18px;
          }

          .erx-flow-visual {
            min-height: 410px;
            transform: scale(.86);
            transform-origin: center;
            margin-left: -7%;
            width: 114%;
          }

          .erx-flow-card-main {
            width: 330px;
            left: 0;
          }

          .erx-flow-card-billing {
            width: 245px;
            right: 0;
          }

          .erx-flow-card-share {
            width: 285px;
            right: 10px;
          }

          .erx-analytics-card {
            padding: 28px 20px;
          }

          .erx-analytics-visual {
            min-height: 310px;
          }

          .erx-big-metric {
            left: 0;
            width: 210px;
          }

          .erx-mini-chart {
            width: 300px;
          }

          .erx-analytics-floating {
            right: 0;
          }

          .erx-workflow-track {
            display: block;
          }

          .erx-workflow-step {
            margin-bottom: 38px;
          }

          .erx-workflow-connector {
            display: none !important;
          }

          .erx-pdf-window {
            min-height: 420px;
          }

          .erx-pdf-sidebar {
            display: none;
          }

          .erx-pdf-body {
            grid-template-columns: 1fr;
          }

          .erx-pdf-paper {
            width: calc(100% - 24px);
            padding: 18px;
            margin: 12px auto;
          }

          .erx-paper-patient {
            gap: 8px;
          }

          .erx-paper-header strong {
            font-size: 11px;
          }

          .erx-paper-header div:last-child strong {
            font-size: 15px;
          }

          .erx-paper-footer {
            margin-top: 15px;
          }

          .erx-final {
            padding: 90px 0;
          }

          .erx-final h2 {
            font-size: 48px;
          }

          .erx-final-buttons {
            flex-direction: column;
          }

          .erx-final-buttons .erx-btn {
            width: 100%;
          }

          .erx-footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 35px 25px;
          }

          .erx-footer-brand {
            grid-column: 1 / -1;
          }

          .erx-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <Navbar />

      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <WorkflowSection />
        <AnalyticsSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}