import { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HeroContent } from './components/HeroContent';
import { MockupSection } from './components/MockupSection';
import { IncludedSection } from './components/IncludedSection';
import { HomepagesSection } from './components/HomepagesSection';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';

// Lazy-loaded routes for performance & code-splitting
const PricingPage = lazy(() => import('./components/pricing/PricingPage').then((m) => ({ default: m.PricingPage })));
const AboutPage = lazy(() => import('./components/about/AboutPage').then((m) => ({ default: m.AboutPage })));

// 7 Product Pages
const AttackSurfaceMappingPage = lazy(() => import('./components/pages/AttackSurfaceMappingPage').then((m) => ({ default: m.AttackSurfaceMappingPage })));
const ThreatIntelligencePage = lazy(() => import('./components/pages/ThreatIntelligencePage').then((m) => ({ default: m.ThreatIntelligencePage })));
const AutomatedFootprintingPage = lazy(() => import('./components/pages/AutomatedFootprintingPage').then((m) => ({ default: m.AutomatedFootprintingPage })));
const ModulesPage = lazy(() => import('./components/pages/ModulesPage').then((m) => ({ default: m.ModulesPage })));
const CustomModulesSdkPage = lazy(() => import('./components/pages/CustomModulesSdkPage').then((m) => ({ default: m.CustomModulesSdkPage })));
const GettingStartedPage = lazy(() => import('./components/pages/GettingStartedPage').then((m) => ({ default: m.GettingStartedPage })));
const RestApiCliPage = lazy(() => import('./components/pages/RestApiCliPage').then((m) => ({ default: m.RestApiCliPage })));

// Checkout, Admin & Legal Pages
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const RecoveryPage = lazy(() => import('./components/checkout/RecoveryPage').then((m) => ({ default: m.RecoveryPage })));
const OrderStatusPage = lazy(() => import('./components/checkout/OrderStatusPage').then((m) => ({ default: m.OrderStatusPage })));
const InvoiceView = lazy(() => import('./components/checkout/InvoiceView').then((m) => ({ default: m.InvoiceView })));
const TermsPage = lazy(() => import('./components/legal/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./components/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const RefundPage = lazy(() => import('./components/legal/RefundPage').then((m) => ({ default: m.RefundPage })));
const LicensePage = lazy(() => import('./components/legal/LicensePage').then((m) => ({ default: m.LicensePage })));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center" aria-label="Loading page">
      <div className="w-8 h-8 rounded-full border-2 border-[#4F8FF7] border-t-transparent animate-spin" />
    </div>
  );
}

function normalizePath(rawPath: string): string {
  const clean = rawPath.toLowerCase().replace(/\/+$/, '') || '/';
  return clean;
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'SpidyDashboard | OSINT & Attack Surface Reconnaissance Dashboard',
  '/pricing': 'Pricing | SpidyDashboard, Student Edition (₹999)',
  '/about': 'About SpidyDashboard | Built for Modern Security Operations',
  '/features/attack-surface-mapping': 'Attack Surface Mapping | Discover Exposed Assets & Subdomains',
  '/features/threat-intelligence': 'Threat Intelligence | Correlate Findings from 200+ Sources',
  '/features/automated-footprinting': 'Automated Footprinting | Scan IPs, Emails, Usernames & CIDRs',
  '/modules': 'All 233 Modules | SpiderFoot OSINT Intelligence Catalog',
  '/modules/custom-sdk': 'Custom Modules & SDK | Build Private OSINT Intelligence Plugins',
  '/docs/getting-started': 'Getting Started Guide | Run Your First Reconnaissance Scan',
  '/docs/rest-api-cli': 'REST API & CLI Reference | Integrate OSINT into CI/CD',
  '/admin': 'Admin Console | SpidyDashboard Payment Verification',
  '/recover': 'Get My Files | SpidyDashboard Recovery Portal',
  '/terms': 'Terms of Service | SpidyDashboard',
  '/privacy': 'Privacy Policy & DPDP Act 2023 | SpidyDashboard',
  '/refund': 'No Refund Policy | SpidyDashboard',
  '/license': 'Software License Agreement | SpidyDashboard',
};

const knownRoutes = Object.keys(PAGE_TITLES);

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = normalizePath(window.location.pathname);
      const h = window.location.hash.toLowerCase();

      if (p === '/admin') return '/admin';
      if (p === '/recover' || p === '/download') return '/recover';
      if (p === '/terms') return '/terms';
      if (p === '/privacy') return '/privacy';
      if (p === '/refund') return '/refund';
      if (p === '/license') return '/license';
      if (p.startsWith('/orders/')) return p;

      if (h.startsWith('#pricing') || p === '/pricing' || h.startsWith('#scan') || p === '/scan' || h.startsWith('#signup')) return '/pricing';
      if (h.startsWith('#about') || p === '/about') return '/about';
      if (p.includes('/attack-surface')) return '/features/attack-surface-mapping';
      if (p.includes('/threat-intelligence')) return '/features/threat-intelligence';
      if (p.includes('/automated-footprinting')) return '/features/automated-footprinting';
      if (p === '/modules/custom-sdk' || p.includes('custom-sdk')) return '/modules/custom-sdk';
      if (p === '/modules' || p.startsWith('/modules')) return '/modules';
      if (p === '/docs/getting-started' || p.includes('getting-started') || h.startsWith('#docs') || p === '/docs') return '/docs/getting-started';
      if (p === '/docs/rest-api-cli' || p.includes('rest-api') || p.includes('cli')) return '/docs/rest-api-cli';
      return p;
    }
    return '/';
  });

  useEffect(() => {
    // Update Document Title
    const title = PAGE_TITLES[currentPath] || 'SpidyDashboard | OSINT Attack Surface Dashboard';
    document.title = title;

    const handleLocationChange = () => {
      const p = normalizePath(window.location.pathname);
      const h = window.location.hash.toLowerCase();

      if (p === '/admin') {
        setCurrentPath('/admin');
      } else if (p === '/recover' || p === '/download') {
        setCurrentPath('/recover');
      } else if (p === '/terms') {
        setCurrentPath('/terms');
      } else if (p === '/privacy') {
        setCurrentPath('/privacy');
      } else if (p === '/refund') {
        setCurrentPath('/refund');
      } else if (p === '/license') {
        setCurrentPath('/license');
      } else if (p.startsWith('/orders/')) {
        setCurrentPath(p);
      } else if (h.startsWith('#pricing') || p === '/pricing' || h.startsWith('#scan') || p === '/scan' || h.startsWith('#signup')) {
        setCurrentPath('/pricing');
      } else if (h.startsWith('#about') || p === '/about') {
        setCurrentPath('/about');
      } else if (p.includes('/attack-surface')) {
        setCurrentPath('/features/attack-surface-mapping');
      } else if (p.includes('/threat-intelligence')) {
        setCurrentPath('/features/threat-intelligence');
      } else if (p.includes('/automated-footprinting')) {
        setCurrentPath('/features/automated-footprinting');
      } else if (p === '/modules/custom-sdk' || p.includes('custom-sdk')) {
        setCurrentPath('/modules/custom-sdk');
      } else if (p === '/modules' || p.startsWith('/modules')) {
        setCurrentPath('/modules');
      } else if (p === '/docs/getting-started' || p.includes('getting-started') || h.startsWith('#docs') || p === '/docs') {
        setCurrentPath('/docs/getting-started');
      } else if (p === '/docs/rest-api-cli' || p.includes('rest-api') || p.includes('cli')) {
        setCurrentPath('/docs/rest-api-cli');
      } else {
        setCurrentPath(p);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Global Click Interceptor for Client-side Navigation
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;

      // Handle external links or anchors
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        return;
      }

      // Check if it's an internal route
      const [pathOnly, hash] = href.split('#');
      const normalized = normalizePath(pathOnly || window.location.pathname);

      if (href.startsWith('#')) {
        if (hash === 'contact' || hash === 'contact-developer') {
          return;
        }
        if (hash === 'scan' || hash === 'signup') {
          e.preventDefault();
          window.history.pushState({}, '', '/pricing');
          setCurrentPath('/pricing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (hash === 'docs') {
          e.preventDefault();
          window.history.pushState({}, '', '/docs/getting-started');
          setCurrentPath('/docs/getting-started');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (hash) {
          const el = document.getElementById(hash);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }

      if (knownRoutes.includes(normalized) || normalized.startsWith('/orders/')) {
        e.preventDefault();
        window.history.pushState({}, '', href);
        setCurrentPath(normalized);

        if (hash) {
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 60);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      document.removeEventListener('click', handleClick);
    };
  }, [currentPath]);

  // Admin Panel
  if (currentPath === '/admin') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <AdminPanel />
      </Suspense>
    );
  }

  // Recovery Portal ("Get My Files")
  if (currentPath === '/recover' || currentPath === '/download') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <RecoveryPage />
      </Suspense>
    );
  }

  // Legal Pages
  if (currentPath === '/terms') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <TermsPage />
      </Suspense>
    );
  }
  if (currentPath === '/privacy') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <PrivacyPage />
      </Suspense>
    );
  }
  if (currentPath === '/refund') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <RefundPage />
      </Suspense>
    );
  }
  if (currentPath === '/license') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <LicensePage />
      </Suspense>
    );
  }

  // Order Details & Invoice Routes
  if (currentPath.startsWith('/orders/')) {
    const parts = currentPath.split('/');
    // e.g. /orders/SPIDY-7K3Q9 or /orders/SPIDY-7K3Q9/invoice
    const reference = parts[2]?.toUpperCase();
    if (parts[3] === 'invoice') {
      return (
        <Suspense fallback={<RouteLoader />}>
          <InvoiceView reference={reference} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<RouteLoader />}>
        <OrderStatusPage reference={reference} />
      </Suspense>
    );
  }

  // Route 1: Attack Surface Mapping
  if (currentPath === '/features/attack-surface-mapping') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <AttackSurfaceMappingPage />
      </Suspense>
    );
  }

  // Route 2: Threat Intelligence
  if (currentPath === '/features/threat-intelligence') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <ThreatIntelligencePage />
      </Suspense>
    );
  }

  // Route 3: Automated Footprinting
  if (currentPath === '/features/automated-footprinting') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <AutomatedFootprintingPage />
      </Suspense>
    );
  }

  // Route 4: All 233 Modules
  if (currentPath === '/modules') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <ModulesPage />
      </Suspense>
    );
  }

  // Route 5: Custom Modules & SDK
  if (currentPath === '/modules/custom-sdk') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <CustomModulesSdkPage />
      </Suspense>
    );
  }

  // Route 6: Getting Started Guide
  if (currentPath === '/docs/getting-started') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <GettingStartedPage />
      </Suspense>
    );
  }

  // Route 7: REST API & CLI
  if (currentPath === '/docs/rest-api-cli') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <RestApiCliPage />
      </Suspense>
    );
  }

  // Pricing Page
  if (currentPath === '/pricing') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <PricingPage />
      </Suspense>
    );
  }

  // About Page
  if (currentPath === '/about') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <AboutPage />
      </Suspense>
    );
  }

  // Default Home Page
  return (
    <div className="min-h-screen bg-white text-[#0B0B14] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-clip">
      {/* Navigation Bar */}
      <Navbar currentPath="/" />

      {/* Main Content Container */}
      <main className="relative flex flex-col items-center justify-start overflow-visible w-full">
        {/* Hero Title and CTA Buttons */}
        <HeroContent />

        {/* 3-Card Fanned Mockup with 1800px Perspective and Spring Motions */}
        <MockupSection />

        {/* "What is included in SpidyDashboard" Bento Grid Section */}
        <IncludedSection />

        {/* "See every risk in one place." Showcase Section */}
        <HomepagesSection />

        {/* "Unleash the power of SpidyDashboard" CTA Banner Section */}
        <CtaBanner />

        {/* Footer Section */}
        <Footer />
      </main>
    </div>
  );
}

export default App;

