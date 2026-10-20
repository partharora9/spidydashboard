import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  Shield,
  Search,
  Terminal,
  FileCode,
  Globe,
  Database,
  Mail,
} from 'lucide-react';
import { SpidyLogo } from './SpidyLogo';
import { ContactModal } from './contact/ContactModal';

export interface DropdownItem {
  title: string;
  desc: string;
  icon: ReactNode;
  href: string;
}

export const dropdownData: Record<string, DropdownItem[]> = {
  Features: [
    {
      title: 'Attack Surface Mapping',
      desc: 'Discover exposed assets and subdomains',
      icon: <Globe className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/features/attack-surface-mapping',
    },
    {
      title: 'Threat Intelligence',
      desc: 'Correlate findings from 200+ sources',
      icon: <Shield className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/features/threat-intelligence',
    },
    {
      title: 'Automated Footprinting',
      desc: 'Scan IPs, emails, usernames and CIDRs',
      icon: <Search className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/features/automated-footprinting',
    },
  ],
  Modules: [
    {
      title: 'All 233 Modules',
      desc: 'Shodan, VirusTotal, HaveIBeenPwned & more',
      icon: <Database className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/modules',
    },
    {
      title: 'Custom Modules & SDK',
      desc: 'Build private OSINT intelligence plugins',
      icon: <Terminal className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/modules/custom-sdk',
    },
  ],
  Docs: [
    {
      title: 'Getting Started Guide',
      desc: 'Run your first reconnaissance scan',
      icon: <FileCode className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/docs/getting-started',
    },
    {
      title: 'REST API & CLI Reference',
      desc: 'Integrate scanning into your CI/CD pipelines',
      icon: <Terminal className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/docs/rest-api-cli',
    },
  ],
  'About Us': [
    {
      title: 'Built for Modern SecOps',
      desc: 'High performance OSINT intelligence engine',
      icon: <Globe className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/about',
    },
    {
      title: 'Creator Story',
      desc: 'Parth Arora (SOC Analyst) & creator story',
      icon: <Shield className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/about#developer',
    },
    {
      title: 'Security & Privacy',
      desc: 'Zero data retention on target discoveries',
      icon: <FileCode className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/about#security',
    },
    {
      title: 'Contact Developer',
      desc: 'Direct email: hello@spidydashboard.com',
      icon: <Mail className="w-4 h-4 text-[#4F8FF7]" />,
      href: '#contact-developer',
    },
  ],
};

const navItems = ['Features', 'Modules', 'Docs', 'Pricing', 'About Us'];

interface NavbarProps {
  currentPath?: string;
}

export const Navbar = ({ currentPath }: NavbarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [cartCount] = useState(0);
  const [activePath, setActivePath] = useState(currentPath || '/');
  const timeoutRef = useRef<number | null>(null);
  const menuContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPath) {
      setActivePath(currentPath);
    } else if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname.toLowerCase());
    }
  }, [currentPath]);

  // Lock body scroll, trap focus, and mark root inert when mobile sheet is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      const root = document.getElementById('root');
      if (root) root.setAttribute('aria-hidden', 'true');

      // Auto-focus first focusable item in sheet
      setTimeout(() => {
        const firstFocusable = mobileSheetRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 50);

      const handlePopState = () => setMobileMenuOpen(false);
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        if (root) root.removeAttribute('aria-hidden');
        window.removeEventListener('popstate', handlePopState);
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileMenuOpen]);

  // Trap Tab focus & close on Escape inside mobile sheet
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        hamburgerBtnRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        const sheet = mobileSheetRef.current;
        if (!sheet) return;
        const focusables = Array.from(
          sheet.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Listen for custom open-contact-modal events & URL hash #contact or #contact-developer
  useEffect(() => {
    const handleOpenContact = () => setContactModalOpen(true);
    const checkHash = () => {
      if (
        typeof window !== 'undefined' &&
        (window.location.hash === '#contact' || window.location.hash === '#contact-developer')
      ) {
        setContactModalOpen(true);
      }
    };
    checkHash();
    window.addEventListener('open-contact-modal', handleOpenContact);
    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('open-contact-modal', handleOpenContact);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Handle hover open with debounce on leave (hover bridge)
  const handleMouseEnter = (item: string) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(item);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 180); // 180ms hover bridge
  };

  // Keyboard navigation
  const handleTriggerKeyDown = (e: React.KeyboardEvent, item: string) => {
    if (e.key === 'Escape') {
      setActiveDropdown(null);
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdown(item);
      setTimeout(() => {
        const container = menuContainerRefs.current[item];
        const firstLink = container?.querySelector('a');
        firstLink?.focus();
      }, 50);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent, item: string) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setActiveDropdown(null);
      const btn = document.getElementById(`nav-trigger-${item.toLowerCase().replace(/\s+/g, '-')}`);
      btn?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const container = menuContainerRefs.current[item];
      if (!container) return;
      const links = Array.from(container.querySelectorAll('a'));
      const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % links.length;
        links[nextIndex]?.focus();
      } else {
        const prevIndex = (currentIndex - 1 + links.length) % links.length;
        links[prevIndex]?.focus();
      }
    }
  };

  // Check if a dropdown group has an active item
  const isNavGroupActive = (item: string) => {
    if (item === 'Pricing') return activePath === '/pricing';
    if (item === 'About Us') return activePath.startsWith('/about');
    const items = dropdownData[item];
    if (!items) return false;
    return items.some(
      (sub) => activePath === sub.href || (sub.href !== '/' && activePath.startsWith(sub.href))
    );
  };


  const navLinkVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[1000] w-full bg-white/[0.98] backdrop-blur-md transition-colors border-b border-black/[0.06]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(var(--header-h) + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Brand Logo (wordmark responsive for small screens) */}
          <a
            href="/"
            className="flex items-center group mr-4 sm:mr-6 shrink-0 overflow-visible"
            aria-label="SpidyDashboard Home"
          >
            <SpidyLogo size={28} withWordmark className="text-[17px] min-[360px]:text-[20px]" />
          </a>

          {/* Center: Desktop Nav (visible at lg >= 1024px) */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8" aria-label="Main Navigation">
            {navItems.map((item, index) => {
              const isOpen = activeDropdown === item;
              const isGroupActive = isNavGroupActive(item);
              const itemSlug = item.toLowerCase().replace(/\s+/g, '-');

              if (item === 'Pricing') {
                return (
                  <motion.div
                    key={item}
                    custom={index}
                    variants={navLinkVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative py-2"
                  >
                    <a
                      href="/pricing"
                      className={`text-[16px] font-medium transition-colors py-1 px-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8FF7] ${
                        activePath === '/pricing'
                          ? 'text-[#4F8FF7] font-semibold'
                          : 'text-[#111111] hover:text-[#4F8FF7]'
                      }`}
                    >
                      Pricing
                    </a>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={item}
                  custom={index}
                  variants={navLinkVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative py-2"
                  onMouseEnter={() => handleMouseEnter(item)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    id={`nav-trigger-${itemSlug}`}
                    onClick={() => setActiveDropdown(isOpen ? null : item)}
                    onKeyDown={(e) => handleTriggerKeyDown(e, item)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`nav-menu-${itemSlug}`}
                    className={`flex items-center gap-1.5 text-[16px] font-medium transition-colors py-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8FF7] rounded-md px-1 cursor-pointer ${
                      isGroupActive
                        ? 'text-[#4F8FF7] font-semibold'
                        : 'text-[#111111] hover:text-[#4F8FF7]'
                    }`}
                  >
                    <span>{item}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                      className={`inline-flex items-center ${
                        isGroupActive ? 'text-[#4F8FF7]' : 'text-[#111111] group-hover:text-[#4F8FF7]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                    </motion.span>
                  </button>

                  {/* Dropdown Panel with Hover Bridge */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`nav-menu-${itemSlug}`}
                        role="menu"
                        aria-labelledby={`nav-trigger-${itemSlug}`}
                        ref={(el) => {
                          menuContainerRefs.current[item] = el;
                        }}
                        onKeyDown={(e) => handleMenuKeyDown(e, item)}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 w-[330px] z-[500] pointer-events-auto"
                      >
                        <div className="bg-white rounded-[20px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-black/[0.08] backdrop-blur-xl">
                          <div className="text-[11px] font-bold tracking-wider uppercase text-gray-400 px-3 py-1 font-mono">
                            {item}
                          </div>
                          <div className="space-y-1 mt-1">
                            {dropdownData[item]?.map((subItem) => {
                              const isItemActive =
                                activePath === subItem.href ||
                                (subItem.href !== '/' && activePath.startsWith(subItem.href.split('#')[0]));

                              return (
                                <a
                                  key={subItem.title}
                                  href={subItem.href}
                                  role="menuitem"
                                  onClick={(e) => {
                                    if (
                                      subItem.title === 'Contact Developer' ||
                                      subItem.href === '#contact-developer' ||
                                      subItem.href.startsWith('mailto:')
                                    ) {
                                      e.preventDefault();
                                      setActiveDropdown(null);
                                      setContactModalOpen(true);
                                      return;
                                    }
                                    setActiveDropdown(null);
                                  }}
                                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group/item focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8FF7] ${
                                    isItemActive
                                      ? 'bg-blue-50/70 text-[#4F8FF7]'
                                      : 'hover:bg-[#F5F5F7] text-[#0B0B14]'
                                  }`}
                                >
                                  <div
                                    className={`p-2 rounded-lg transition-colors mt-0.5 shrink-0 ${
                                      isItemActive
                                        ? 'bg-[#4F8FF7] text-white shadow-sm'
                                        : 'bg-blue-50 text-[#4F8FF7] group-hover/item:bg-blue-100'
                                    }`}
                                  >
                                    {subItem.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-semibold text-[#0B0B14] group-hover/item:text-[#4F8FF7] transition-colors flex items-center justify-between">
                                      <span className="truncate">{subItem.title}</span>
                                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-[#4F8FF7] shrink-0" />
                                    </div>
                                    <div className="text-[13px] text-gray-600 leading-snug mt-0.5 line-clamp-2">
                                      {subItem.desc}
                                    </div>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </nav>

          {/* Right: Cart, Pricing, Get code CTA (desktop >= 1024px) */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            {/* Cart Icon */}
            <a
              href="/pricing"
              className="relative p-2 text-[#0B0B14] hover:text-[#4F8FF7] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </a>

            {/* Start scan blue pill with soft halo ring */}
            <motion.div
              className="relative rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 6px rgba(79,143,247,0.18)',
                  '0 0 0 10px rgba(79,143,247,0.0)',
                  '0 0 0 6px rgba(79,143,247,0.18)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.a
                href="/pricing"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] text-white text-[15px] font-semibold px-[20px] py-[11px] rounded-full shadow-[0_4px_14px_rgba(79,143,247,0.35)] transition-all whitespace-nowrap min-h-[44px]"
              >
                Get Student Edition
              </motion.a>
            </motion.div>
          </div>

          {/* Mobile Actions: Cart + 44px Hamburger Toggle (visible under 1024px) */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="/pricing"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#0B0B14] rounded-full hover:bg-gray-100"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </a>
            <button
              id="mobile-menu-trigger"
              ref={hamburgerBtnRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#0B0B14] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#4F8FF7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8FF7] rounded-xl cursor-pointer"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-sheet"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5 overflow-hidden">
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 bg-[#0B0B14] block rounded-full origin-center"
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="w-5 h-0.5 bg-[#0B0B14] block rounded-full"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-0.5 bg-[#0B0B14] block rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Sheet Menu (<1024px) Rendered in Portal to document.body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                id="mobile-menu-sheet"
                ref={mobileSheetRef}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  top: 'calc(var(--header-h) + env(safe-area-inset-top, 0px))',
                  height: 'auto',
                  zIndex: 999,
                  backgroundColor: '#ffffff',
                  overscrollBehavior: 'contain',
                  paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
                }}
                className="lg:hidden bg-white overflow-y-auto px-5 sm:px-6 py-6 flex flex-col justify-between shadow-2xl border-b border-gray-200"
                role="dialog"
                aria-modal="true"
                aria-label="Site Navigation Menu"
              >
                <div className="flex flex-col gap-2">
                  {['Features', 'Modules', 'Docs'].map((category) => {
                    const isExpanded = expandedMobileCategory === category;
                    const isGroupActive = isNavGroupActive(category);

                    return (
                      <div key={category} className="border-b border-gray-100/80 pb-1">
                        <button
                          onClick={() =>
                            setExpandedMobileCategory(isExpanded ? null : category)
                          }
                          className="w-full flex items-center justify-between min-h-[56px] py-2 text-[17px] font-semibold text-[#111111] hover:text-[#4F8FF7] transition-colors cursor-pointer"
                          aria-expanded={isExpanded}
                        >
                          <span className={isGroupActive ? 'text-[#4F8FF7]' : ''}>{category}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#4F8FF7]' : ''
                            }`}
                          />
                        </button>

                        {/* Mobile Accordion Items (min 56px height, font >= 14px) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-1 pr-1 pt-1 pb-3 space-y-2"
                            >
                              {dropdownData[category]?.map((subItem) => (
                                <a
                                  key={subItem.title}
                                  href={subItem.href}
                                  onClick={(e) => {
                                    if (
                                      subItem.title === 'Contact Developer' ||
                                      subItem.href === '#contact-developer' ||
                                      subItem.href.startsWith('mailto:')
                                    ) {
                                      e.preventDefault();
                                      setMobileMenuOpen(false);
                                      setContactModalOpen(true);
                                      return;
                                    }
                                    setMobileMenuOpen(false);
                                  }}
                                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50/90 active:bg-blue-50 transition-colors min-h-[56px]"
                                >
                                  <div className="p-2.5 rounded-xl bg-blue-100/80 text-[#4F8FF7] shrink-0">
                                    {subItem.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[15px] font-semibold text-[#0B0B14]">
                                      {subItem.title}
                                    </div>
                                    <div className="text-[14px] text-gray-600 leading-snug">
                                      {subItem.desc}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Direct Page Links: 56px tap targets */}
                  <a
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center min-h-[56px] text-[17px] font-semibold text-[#111111] hover:text-[#4F8FF7] border-b border-gray-100/80 transition-colors"
                  >
                    Pricing &amp; Plans
                  </a>
                  <a
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center min-h-[56px] text-[17px] font-semibold text-[#111111] hover:text-[#4F8FF7] border-b border-gray-100/80 transition-colors"
                  >
                    About SpidyDashboard
                  </a>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setContactModalOpen(true);
                    }}
                    className="w-full flex items-center min-h-[56px] text-[17px] font-semibold text-[#111111] hover:text-[#4F8FF7] border-b border-gray-100/80 transition-colors text-left cursor-pointer"
                  >
                    Contact Developer
                  </button>
                </div>

                {/* Full-width "Start free scan" button pinned at bottom */}
                <div className="pt-6 pb-2 border-t border-gray-100 flex flex-col gap-3 mt-auto">
                  <a
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center min-h-[52px] py-3.5 px-6 text-[16px] font-bold text-white bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] rounded-full shadow-[0_4px_16px_rgba(79,143,247,0.35)] active:scale-[0.98] transition-all text-center cursor-pointer"
                  >
                    Start free scan
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
};
