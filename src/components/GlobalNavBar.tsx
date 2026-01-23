import React from 'react'
import Links from 'next/link'
import { Home, FileText, Clipboard, Wallet, CreditCard, Settings, CircleQuestionMark, LucideIcon } from 'lucide-react'

interface NavigationItem {
  id: number,
  icon: LucideIcon,
  name: string,
  href: string
}

const navigationItems: NavigationItem[] = [{
  id: 1,
  icon: Home,
  name: 'Dashboard',
  href: '/dashboard',
},{
  id: 2,
  icon: FileText,
  name: 'Policies',
  href: '/policies',
}, {
  id: 3,
  icon: Clipboard,
  name: 'Claims',
  href: '/claims',
}, {
  id: 4,
  icon: Wallet,
  name: 'Wallet',
  href: '/wallet',
}, {
  id: 5,
  icon: CreditCard,
  name: 'Payments',
  href: '/payments',
}, {
  id: 6,
  icon: Settings,
  name: 'Settings',
  href: '/settings',
}, {
  id: 7,
  icon: CircleQuestionMark,
  name: 'Help & Support',
  href: '/help&support',
}]

const NavHeader =()=> <h2 className='text-white font-bold text-center'>
  Stellar<span className='text-[#22BBF9]'>Insured</span>
</h2>
const GlobalNavBar = () => {
  return (
    <nav className='w-68 min-h-[96vh] border border-[#E0D7D7] rounded-[15px] my-3 mx-6.5 py-3 px-6 text-xl '>
      {/* Navigation bar content goes here */}
      <NavHeader/>

      <ul className='font-bold flex flex-col gap-6 mt-10'>
        {navigationItems.map((item) => (
          <li key={item.id} className='hover:bg-[#1E2433] active:bg-[#1E2433] focused:bg-[#1E2433] rounded-[10px] '>
            <Links href={item.href} className='flex items-center gap-2 text-white px-5 py-3.5'>
              <item.icon className='w-6 h-6' />
              {item.name}
            </Links>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default GlobalNavBar
