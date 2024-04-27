import React from 'react';
import {NavLink, useLocation} from "react-router-dom";

const Layout = ({ children }) => {
    const location = useLocation();
    const segments = location.pathname.split('/');
    const segmentsPath = location.pathname.split('/');
    const path = segments.pop();
    const id = 'board' === path ? segmentsPath[segmentsPath.length - 4] : ['generate', 'diagrams'].includes(path) ? segmentsPath[segmentsPath.length - 2] : undefined;
    const activeLinkClass = "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500";
    const inactiveLinkClass = "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
    return (
        <div className="flex flex-col min-h-screen">
            <nav className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Dynamic Soft</span>
                    </a>
                    <div className="w-full md:w-auto" id="navbar-sticky">
                        <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li>
                            <NavLink to="/" className={path === "" ? activeLinkClass : inactiveLinkClass}
                                   aria-current="page">Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="/solutions" className={['solutions', 'projects', 'diagrams', 'board', 'generate'].includes(path) ? activeLinkClass : inactiveLinkClass}>Solutions</NavLink>
                            </li>
                            <li>
                                <NavLink to="/teams" className={path === 'teams' ? activeLinkClass : inactiveLinkClass}>Teams</NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="flex-grow bg-gray-100">{children}</main>

            <footer className="bg-gray-800 text-white py-4 px-6 w-full">
                <div className="mx-auto">
                    <p>Dynamic Soft © Hamza Jguerim - 2024</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;