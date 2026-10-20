import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ChevronDown,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
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
      title: 'REST API & CLI',
      desc: 'Integrate scanning into your CI/CD pipelines',
      icon: <Terminal className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/docs/rest-api-cli',
    },
  ],
  Pricing: [
    {
      title: 'Standard & Complete Kit',
      desc: 'One-time source code purchase with instant download',
      icon: <Sparkles className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/pricing',
    },
    {
      title: 'Feature Comparison',
      desc: 'Detailed breakdown of modules, report and PPT',
      icon: <Shield className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/pricing#comparison',
    },
  ],
  'About Us': [
    {
      title: 'About SpidyDashboard',
      desc: 'Built for modern security operations',
      icon: <Shield className="w-4 h-4 text-[#4F8FF7]" />,
      href: '/about',
    },
    {
      title: 'Meet the Developer',
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
      desc: 'Direct email: parthxcore@gmail.com',
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

  useEffect(() => {
    if (currentPath) {
      setActivePath(currentPath);
    } else if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname.toLowerCase());
    }
  }, [currentPath]);

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
      // Focus first item
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
      const triggerBtn = document.getElementById(`nav-trigger-${item.toLowerCase().replace(/\s+/g, '-')}`);
      triggerBtn?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const container = menuContainerRefs.current[item];
      if (!container) return;
      const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a'));
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

  // Check if current page belongs to this nav group
  const isNavGroupActive = (item: string): boolean => {
    const items = dropdownData[item] || [];
    return items.some((sub) => {
      const hrefPath = sub.href.split('#')[0].toLowerCase();
      return hrefPath && hrefPath !== '/' && activePath.startsWith(hrefPath);
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const navLinkVariants: Variants = {
    hidden: { opacity: 0, y: -8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <>
      {/* Thin 1px black line at the very top edge */}
      <div className="w-full h-[1px] bg-black fixed top-0 left-0 right-0 z-50 pointer-events-none" />

      <motion.header
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full h-[88px] sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-colors border-b border-black/[0.04]"
      >
        <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <a
            href="/"
            className="flex items-center group mr-6 shrink-0 overflow-visible"
            aria-label="SpidyDashboard Home"
          >
            <SpidyLogo size={28} withWordmark />
          </a>

          {/* Center: Desktop Nav with Hover Bridge and Keyboard Support */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navItems.map((item, index) => {
              const isOpen = activeDropdown === item;
              const isGroupActive = isNavGroupActive(item);
              const itemSlug = item.toLowerCase().replace(/\s+/g, '-');

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
                    className={`flex items-center gap-1.5 text-[16px] font-medium transition-colors py-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8FF7] rounded-md px-1 ${
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
                        // pt-3 creates the invisible bridge gap
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 w-[320px] z-50 pointer-events-auto"
                      >
                        <div className="bg-white rounded-[20px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-black/[0.08] backdrop-blur-xl">
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

          {/* Right: Cart, Pricing, Get code CTA */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            {/* Cart Icon */}
            <a
              href="/pricing"
              className="relative p-2 text-[#0B0B14] hover:text-[#4F8FF7] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </a>

            {/* Pricing Link */}
            <a
              href="/pricing"
              className={`text-[16px] font-medium transition-colors whitespace-nowrap ${
                activePath === '/pricing' ? 'text-[#4F8FF7] font-semibold' : 'text-[#0B0B14] hover:text-[#4F8FF7]'
              }`}
            >
              Pricing
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
                className="inline-flex items-center justify-center bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] text-white text-[15px] font-semibold px-[20px] py-[11px] rounded-full shadow-[0_4px_14px_rgba(79,143,247,0.35)] transition-all whitespace-nowrap"
              >
                Get source code
              </motion.a>
            </motion.div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <a
              href="/pricing"
              className="p-2 text-[#0B0B14]"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0B0B14] focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] rounded-lg"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Accordion Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}
              className="md:hidden max-h-[calc(100vh-88px)] overflow-y-auto bg-white/98 border-b border-gray-200 shadow-2xl px-6 py-6"
            >
              <div className="flex flex-col gap-3">
                {navItems.map((item) => {
                  const isExpanded = expandedMobileCategory === item;
                  const isGroupActive = isNavGroupActive(item);

                  return (
                    <div key={item} className="border-b border-gray-100 pb-2">
                      <button
                        onClick={() =>
                          setExpandedMobileCategory(isExpanded ? null : item)
                        }
                        className="w-full flex items-center justify-between py-2 text-[17px] font-semibold text-[#111111] hover:text-[#4F8FF7] transition-colors"
                      >
                        <span className={isGroupActive ? 'text-[#4F8FF7]' : ''}>{item}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#4F8FF7]' : ''
                          }`}
                        />
                      </button>

                      {/* Mobile Accordion Children */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-2 pr-1 pt-1 pb-3 space-y-2"
                          >
                            {dropdownData[item]?.map((subItem) => (
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
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80 active:bg-blue-50 hover:bg-blue-50/60 transition-colors"
                              >
                                <div className="p-2 rounded-lg bg-blue-100/70 text-[#4F8FF7] shrink-0 mt-0.5">
                                  {subItem.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[14px] font-semibold text-[#0B0B14]">
                                    {subItem.title}
                                  </div>
                                  <div className="text-[12px] text-gray-500 leading-snug">
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

                <div className="pt-4 flex flex-col gap-3">
                  <a
                    href="/docs/getting-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-[15px] font-medium text-[#0B0B14] rounded-full border border-gray-200 hover:bg-gray-50"
                  >
                    Documentation
                  </a>
                  <a
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 text-[15px] font-semibold text-white bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] rounded-full shadow-[0_4px_14px_rgba(79,143,247,0.35)]"
                  >
                    Get source code (₹499)
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
};

