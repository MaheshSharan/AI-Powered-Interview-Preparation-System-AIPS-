import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

const InterviewGuidelines = ({ isOpen, onClose, role = 'Software Engineer' }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const guidelines = {
    company: [
      'Research the company\'s products and mission',
      'Review recent company news and developments',
      'Understand the company culture and values',
      'Prepare questions about the company'
    ],
    technical: [
      'Ensure stable internet connection (min 5 Mbps)',
      'Test your camera and microphone',
      'Have a quiet, well-lit environment',
      'Keep your resume and portfolio accessible',
      'Have a code editor ready if required'
    ],
    behavioral: [
      'Use the STAR method for behavioral questions',
      'Prepare examples of past projects',
      'Be ready to discuss your resume in detail',
      'Practice active listening',
      'Maintain professional body language'
    ]
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-slate-900 border border-slate-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-slate-400 hover:text-slate-300"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-white mb-6">
                      Interview Guidelines for {role}
                    </Dialog.Title>

                    <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                      <Tab.List className="flex space-x-2 rounded-lg bg-slate-800/50 p-1">
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${
                              selected
                                ? 'bg-indigo-500 text-white shadow'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`
                          }
                        >
                          Company
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${
                              selected
                                ? 'bg-indigo-500 text-white shadow'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`
                          }
                        >
                          Technical
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${
                              selected
                                ? 'bg-indigo-500 text-white shadow'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`
                          }
                        >
                          Behavioral
                        </Tab>
                      </Tab.List>

                      <Tab.Panels className="mt-4">
                        <Tab.Panel>
                          <ul className="space-y-3">
                            {guidelines.company.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start"
                              >
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                                  {index + 1}
                                </span>
                                <span className="ml-3 text-sm text-slate-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </Tab.Panel>

                        <Tab.Panel>
                          <ul className="space-y-3">
                            {guidelines.technical.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start"
                              >
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                                  {index + 1}
                                </span>
                                <span className="ml-3 text-sm text-slate-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </Tab.Panel>

                        <Tab.Panel>
                          <ul className="space-y-3">
                            {guidelines.behavioral.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start"
                              >
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                                  {index + 1}
                                </span>
                                <span className="ml-3 text-sm text-slate-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default InterviewGuidelines;
