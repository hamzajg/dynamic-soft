import React, {useContext} from 'react';
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {AuthenticationContext} from "../modules/authentication/AuthenticatonProvider";

const Layout = ({ children }) => {
    const { isAuthenticated, logout, user } = useContext(AuthenticationContext);
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.split('/').pop();
    const isBoardPage = location.pathname.includes('/board');
    
    const activeLinkClass = "block py-3 px-4 text-accent font-semibold transition-all duration-200 border-b-2 border-accent min-h-[44px] flex items-center";
    const inactiveLinkClass = "block py-3 px-4 text-text-secondary hover:text-accent transition-all duration-200 border-b-2 border-transparent hover:border-accent-dim min-h-[44px] flex items-center";
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans selection:bg-accent/30">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl saturate-[180%] border-b border-border-subtle shadow-lg shadow-black/20">
                <div className="flex items-center justify-between mx-auto max-w-7xl px-6 h-16">
                    <NavLink to="/" className="flex items-center space-x-2 group">
                        <span className="self-center text-xl font-display tracking-widest text-accent group-hover:text-accent-hover transition-colors">
                            DYNAMIC<span className="text-text-primary">SOFT</span>
                        </span>
                    </NavLink>
                    
                    <div className="hidden md:flex md:items-center md:space-x-2">
                        <ul className="flex space-x-1 font-medium">
                            <li>
                                <NavLink to="/" className={location.pathname === "/" ? activeLinkClass : inactiveLinkClass}>
                                    HOME
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/solutions" className={['solutions', 'projects', 'diagrams', 'board', 'generate'].includes(path) || location.pathname.includes('/solutions') ? activeLinkClass : inactiveLinkClass}>
                                    SOLUTIONS
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/marketplace" className={path === 'marketplace' ? activeLinkClass : inactiveLinkClass}>
                                    MARKETPLACE
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/teams" className={path === 'teams' ? activeLinkClass : inactiveLinkClass}>
                                    TEAMS
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-text-secondary">{user?.name}</span>
                                <button onClick={() => { logout(); navigate('/'); }} className="px-6 py-2.5 text-sm font-semibold text-text-primary border border-border-subtle bg-surface-elevated rounded-sm hover:bg-surface-hover transition-all flex items-center justify-center min-h-[44px]">
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <NavLink to="/authentication" className="px-6 py-2.5 text-sm font-semibold text-background bg-accent rounded-sm hover:bg-accent-hover transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.25)] flex items-center justify-center min-h-[44px]">
                                LOGIN
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-16 animate-fade-in">
                <div className="mx-auto max-w-7xl px-6 py-10">
                    {children}
                </div>
            </main>

            {!isBoardPage && (
                <footer className="bg-surface border-t border-border-subtle py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
                    <div className="flex flex-col items-start max-w-sm">
                        <span className="font-display text-base tracking-widest text-accent mb-4">DYNAMICSOFT</span>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Accelerating cloud transformation through business modeling. We provide high-performance solutions for modern enterprises.
                        </p>
                    </div>
                    <div className="flex flex-col items-end space-y-4">
                        <div className="text-text-tertiary text-xs tracking-wider uppercase">
                            © 2026 Dynamic Soft — Designed for SMB Excellence
                        </div>
                    </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;