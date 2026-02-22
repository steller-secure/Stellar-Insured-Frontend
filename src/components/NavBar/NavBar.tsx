'use client';
import logo from '@/components/logo.png'
import Link from 'next/link';
import { useAuth } from '../auth-provider-enhanced';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface NavLink {
  id: number;
  name: string;
  href: string;
}

const navLinks: NavLink[] = [{
  id: 1,
  name: 'Home',
  href: '/'
}, {
  id: 2,
  name: 'About',
  href: '/about'
}, {
  id: 3,
  name: 'Features',
  href: '/#features'
}, {
  id: 4,
  name: 'Insurance',
  href: '/insurance'
}, {
  id: 5,
  name: 'Contact',
  href: '/contact'
}];

const NavBarList = (
  {
    isOpen, setIsOpen
  }: {
    isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  }
) => {

  const { session, signOut } = useAuth();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getLinkClassName = (href: string) => {
    const baseClass = "text-white text-lg font-medium mx-6 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]";
    return isActiveLink(href)
      ? `${baseClass} text-[#22BBF9] border-b-2 border-[#22BBF9]`
      : `${baseClass} hover:text-[#22BBF9]`;
  };

  return (
    <>
      {/* desktop menu */}
      <nav className='hidden lg:flex justify-between items-center w-full h-full m-auto' data-nav="desktop">
        <img src={logo.src} alt="Stellar Insured Logo" className="block" />
        <ul className='flex flex-row mb-3'>
          {navLinks.map((link) => (
            <li key={link.id}>
              <Link href={link.href} className={getLinkClassName(link.href)}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        {session ? (
          <ul className='flex gap-5 justify-between items-center'>
            <li>
              <Link href='/dashboard' className='text-white text-lg font-medium mx-6 hover:text-[#22BBF9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href='/analytics' className='text-white text-lg font-medium mx-6 hover:text-[#22BBF9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'>
                Analytics
              </Link>
            </li>
            <li>
              <button
                className='bg-[#22BBF9] rounded-full px-3 py-1 text-black text-lg font-medium whitespace-nowrap hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'
                aria-label="Disconnect wallet"
              >
                Wallet
              </button>
            </li>
          </ul>
        ) : (
          <ul className='flex gap-5 justify-between items-center'>
            <li>
              <Link href='/signin' className='text-white text-lg font-medium mx-3 hover:text-[#22BBF9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'>
                Sign In
              </Link>
            </li>
            <li>
              <Link href='/signup' className='bg-[#22BBF9] rounded-full px-3 py-1 text-black text-lg font-medium whitespace-nowrap hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'>
                Sign Up
              </Link>
            </li>
          </ul>
        )}
      </nav>
      {/* mobile menu */}
      <nav id="mobile-nav" className={`bg-[#1E2433] border-r-2 border-b-2 border-[#22BBF9] flex lg:hidden flex-col justify-between items-center w-75 h-[80vh] absolute -left-5 -top-6 z-999 p-7 rounded-br-3xl ${isOpen ? 'translate-x-0 transition-transform transform duration-500' : '-translate-x-full'}   ease-in-out`} role="navigation" aria-label="Mobile navigation" data-nav="mobile">
        <ul className='flex flex-col mb-3 h-[60%] w-full justify-between items-center'>
          {navLinks.map((link) => (
            <li key={link.id} className='py-1 px-2 w-full'>
              <Link href={link.href} className={getLinkClassName(link.href)} onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className='flex flex-col h-[40%] gap-6 w-full justify-end items-center'>
          {session ? (
            <>
              <li className='w-full'>
                <Link href='/dashboard' className='text-white text-lg font-medium mx-3 hover:text-[#22BBF9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]' onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li className='w-full'>
                <Link href='/analytics' className='text-white text-lg font-medium mx-3 hover:text-[#22BBF9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]' onClick={() => setIsOpen(false)}>
                  Analytics
                </Link>
              </li>
              <li className='w-full'>
                <button
                  className='bg-[#22BBF9] rounded-full px-3 py-1 text-black text-lg font-medium whitespace-nowrap w-full hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'
                  aria-label="Disconnect wallet"
                >
                  Wallet
                </button>
              </li>
            </>
          ) : (
            <>
              <li className='w-full'>
                <Link href='/signin' className='text-white text-lg font-medium mx-3 hover:text-[#22BBF9] transition-colors duration-200 block text-center focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]' onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
              </li>
              <li className='w-full'>
                <Link href='/signup' className='bg-[#22BBF9] rounded-full px-3 py-1 text-black text-lg font-medium whitespace-nowrap w-full hover:brightness-110 transition-all block text-center focus:outline-none focus:ring-2 focus:ring-[#22BBF9] focus:ring-offset-2 focus:ring-offset-[#1E2433]'>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
        <button type='button' title='Close menu' onClick={() => setIsOpen(false)} aria-label="Close navigation menu">
          <X className='text-white w-5 h-5 absolute z-999 right-5 top-5' />
        </button>
      </nav>

    </>
  )
}

const NavBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Keyboard navigation for desktop + mobile
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const containerSelector = isOpen ? '[data-nav="mobile"]' : '[data-nav="desktop"]';
      const container = document.querySelector(containerSelector);

      if (!container) return;

      const items = Array.from(container.querySelectorAll('a, button')) as HTMLElement[];
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      // ESC closes mobile menu
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        const menuBtn = document.querySelector('[aria-label*="menu"]') as HTMLElement | null;
        menuBtn?.focus();
        return;
      }

      // Arrow / Home / End navigation
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const nextIdx = (currentIndex + 1 + items.length) % items.length;
        items[nextIdx]?.focus();
      } else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) {
        event.preventDefault();
        const prevIdx = (currentIndex - 1 + items.length) % items.length;
        items[prevIdx]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        items[items.length - 1]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus trap when mobile menu opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const mobileNav = document.querySelector('[data-nav="mobile"]');
        const firstLink = mobileNav?.querySelector('a, button') as HTMLElement | null;
        firstLink?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <header className='bg-[#1E2433] fixed z-999 h-[75px] w-[95%] max-w-[1288px] top-[28px] left-1/2 -translate-x-1/2 rounded-[50px] border-2 border-[#22BBF9] flex items-center justify-between px-4 lg:px-8' role="navigation" aria-label="Main navigation">

      {/* desktop navbar */}
      <div className='hidden lg:flex w-full'>
        <NavBarList isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* mobile navbar */}
      <div className='w-full flex lg:hidden justify-between items-center bg-[#1E2433]'>
        <img src={logo.src} alt="Stellar Insured Logo" className="w-28" />
        {isOpen ? (
          <button
            type='button'
            title='Toggle menu'
            onClick={() => setIsOpen(!isOpen)}
            aria-label='Close navigation menu'
            aria-expanded='true'
            aria-controls='mobile-nav'
          >
            <Menu className='text-white w-6 h-6' />
          </button>
        ) : (
          <button
            type='button'
            title='Toggle menu'
            onClick={() => setIsOpen(!isOpen)}
            aria-label='Open navigation menu'
            aria-expanded='false'
            aria-controls='mobile-nav'
          >
            <Menu className='text-white w-6 h-6' />
          </button>
        )}
        {isOpen && (<NavBarList isOpen={isOpen} setIsOpen={setIsOpen} />)}

      </div>


    </header>
  )
}

export default NavBar
