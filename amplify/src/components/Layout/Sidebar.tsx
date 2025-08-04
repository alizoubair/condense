import React, { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  HomeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Insights', href: '/', icon: HomeIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Upload', href: '/upload', icon: CloudArrowUpIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export default function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const location = useLocation();

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div
      className={clsx(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 shadow-xl transition-all duration-300 ease-in-out z-30',
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      )}
      style={{ backgroundColor: '#121212' }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 flex-shrink-0" style={{ color: '#b8b8b8' }} />
            {!isCollapsed && (
              <span className="ml-2 text-xl font-bold text-white transition-opacity duration-200">
                Condense
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative',
                  isActive
                    ? ''
                    : 'hover:bg-gray-800',
                  isCollapsed ? 'justify-center' : ''
                )}
                style={isActive ? { backgroundColor: '#656a76' } : {}}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon 
                  className="h-5 w-5 flex-shrink-0" 
                  style={{ color: isActive ? 'white' : '#b8b8b8' }}
                />
                {!isCollapsed && (
                  <span 
                    className="ml-3 transition-opacity duration-200"
                    style={{ color: isActive ? 'white' : '#b8b8b8' }}
                  >
                    {item.name}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div 
                    className="absolute left-16 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                    style={{ backgroundColor: '#2a2a2a' }}
                  >
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4" style={{ borderTop: '1px solid #2a2a2a' }}>
          <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : '')}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ color: '#b8b8b8' }}>
              <span className="text-sm font-medium">U</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3 transition-opacity duration-200">
                <p className="text-sm font-medium" style={{ color: '#b8b8b8' }}>User</p>
                <p className="text-xs" style={{ color: '#888888' }}>user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4" style={{ backgroundColor: '#121212' }}>
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center">
                  <SparklesIcon className="h-8 w-8" style={{ color: '#b8b8b8' }} />
                  <span className="ml-2 text-xl font-bold text-white">
                    Condense
                  </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <li key={item.name}>
                              <NavLink
                                to={item.href}
                                className={clsx(
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                  isActive
                                    ? ''
                                    : 'hover:bg-gray-800'
                                )}
                                style={{ 
                                  color: isActive ? 'white' : '#b8b8b8',
                                  backgroundColor: isActive ? '#656a76' : 'transparent'
                                }}
                                onClick={onClose}
                              >
                                <item.icon 
                                  className="h-6 w-6 shrink-0" 
                                  style={{ color: isActive ? 'white' : '#b8b8b8' }}
                                />
                                {item.name}
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>

                {/* User info */}
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6" style={{ color: '#b8b8b8' }}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium" style={{ color: '#b8b8b8' }}>U</span>
                  </div>
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">User</span>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}