'use client'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import Footer from './Footer'

const Sidebar = ({ user }: SiderbarProps) => {
    const pathname = usePathname();
  return (
      <section className='sidebar'>
          <nav className='flex flex-col gap-4'>
              <Link href="/"
                  className='mb-12 cursor-pointer flex items-center gap-2'
              >
                  <Image
                      src="/icons/logo.svg"
                      height={34}
                      width={34}
                      alt='Reservex logo'
                      className="size-[24px]"
                  />
                  <h1 className='sidebar-logo'>ReserveX</h1>
              </Link>
              {sidebarLinks.map(item => {
                //   TODO: Read more on next pathnames
                  const isActive = pathname === item.route ||
                    pathname.startsWith(`${item.route}/`)
                  return (
                      <Link
                        href={item.route}
                          key={item.label}
                          className={
                              cn('sidebar-link', {
                                 'bg-bank-gradient': isActive 
                              })
                          }
                      >
                          <div className='relative size-6'>
                              <Image
                                  src={item.imgURL}
                                  alt={item.label}
                                  fill
                                  className={cn({'brightness-[3] invert-0': isActive})}
                              />
                          </div>
                          <p
                              className={cn("sidebar-label",
                                  {"!text-white": isActive})}
                          >{item.label}
                          </p>
                    </Link>)
              })}
              <Footer user={user} />
          </nav>
          FOOTER
      </section>
  )
}

export default Sidebar