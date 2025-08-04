import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { signOut } from 'aws-amplify/auth';
import { clsx } from 'clsx';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Menu toggle button */}
          <button
            type="button"
            className="inline-flex items-center justify-center p-1.5 rounded border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-4 w-4" />
          </button>


        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-gray-50 p-2 transition-colors duration-200">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">U</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                User
              </span>
              <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400 hidden sm:block" />
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-gray-200 ring-opacity-50 focus:outline-none">
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      className={clsx(
                        active ? 'bg-gray-100' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Your Profile
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      className={clsx(
                        active ? 'bg-gray-100' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Settings
                    </button>
                  )}
                </Menu.Item>

                <div className="border-t border-gray-200" />

                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={handleSignOut}
                      className={clsx(
                        active ? 'bg-gray-100' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Sign Out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}