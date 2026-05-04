import React from 'react';
import {Link} from "react-router-dom";
import {StatusBadge} from "../../ui/Shared";

const FeatureCard = ({title, description, icon, tag}) => (
    <div className="p-10 bg-surface border border-border-subtle rounded-md transition-all hover:border-accent/30 hover:bg-surface-hover hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40 group text-left relative flex flex-col h-full">
        <div className="text-text-tertiary text-[9px] font-bold tracking-[0.3em] uppercase mb-8 border-l-2 border-accent pl-3">
            {tag}
        </div>
        <div className="text-5xl mb-8 group-hover:scale-110 transition-transform origin-left">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-4 tracking-tight">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-8 flex-grow">{description}</p>
        <div className="text-accent font-bold text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity uppercase">
            Learn More +
        </div>
    </div>
)

const HomePage = () => {
    return (
        <div className="flex flex-col items-center animate-fade-in pb-24">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-10 py-12 md:py-24 max-w-5xl mx-auto">
                <div className="inline-flex items-center px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-accent border border-accent/20 rounded-full bg-accent/5 mb-4 uppercase">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse mr-2"></span>
                    Powering the Next-Gen Enterprise
                </div>
                <h1 className="text-6xl md:text-8xl font-sans font-bold tracking-tight text-text-primary leading-[1.05]">
                    ENGINEERING <br/>
                    <span className="text-accent drop-shadow-[0_0_30px_rgba(0,212,255,0.2)]">CLARITY</span>
                </h1>
                <p className="text-text-secondary text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                    DynamicSoft bridges the gap between complex business domains and scalable cloud architecture. 
                    Visual modeling, automated workflows, and AI-driven precision.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                    <Link to="/solutions" className="px-12 py-5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:-translate-y-1 active:translate-y-0 min-w-[220px] flex items-center justify-center uppercase tracking-widest text-sm">
                        Start Modeling
                    </Link>
                    <Link to="/teams" className="px-12 py-5 bg-surface-elevated border border-border-subtle hover:border-accent/40 text-text-primary font-bold rounded-sm transition-all hover:bg-surface-hover min-w-[220px] flex items-center justify-center uppercase tracking-widest text-sm">
                        Collaborate
                    </Link>
                </div>
                
                <div className="pt-16 flex items-center space-x-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Built with</span>
                    <a href="https://tanoshii-computing.com" target="_blank" rel="noopener noreferrer" className="font-display text-lg tracking-widest hover:text-accent transition-colors">
                        TANOSHII<span className="text-accent">COMPUTING</span>
                    </a>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full max-w-7xl px-6 py-24 border-t border-border-subtle/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FeatureCard 
                        title="DOMAIN DRIVEN" 
                        description="Focus on the core of your business. Our tools help you identify bounded contexts and ubiquitous language effortlessly."
                        icon="🧩"
                        tag="Strategic"
                    />
                    <FeatureCard 
                        title="EVENT MODELING" 
                        description="Visualize the timeline of your system. Commands, Events, and Read Models working in perfect harmony."
                        icon="⚡"
                        tag="Tactical"
                    />
                    <FeatureCard 
                        title="AI BLUEPRINTS" 
                        description="From visual diagram to executable code. Our AI generates the boilerplate so you can focus on the business logic."
                        icon="🧠"
                        tag="Automation"
                    />
                </div>
            </section>

            {/* Community & Ecosystem */}
            <section className="w-full max-w-7xl px-6 py-24 bg-surface-elevated/20 rounded-3xl border border-border-subtle/50 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/5 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 blur-[120px] rounded-full"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-left">
                        <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-6 uppercase">
                            Join the <span className="text-accent">Community</span>
                        </h2>
                        <p className="text-text-secondary text-lg leading-relaxed mb-8">
                            DynamicSoft is more than a tool—it's an ecosystem. Connect with world-class architects, 
                            share your models, and contribute to the future of business engineering.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <StatusBadge color="accent">1.2k Architects</StatusBadge>
                            <StatusBadge color="success">Open Source Core</StatusBadge>
                            <StatusBadge color="warning">Weekly Workshops</StatusBadge>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto min-w-[300px]">
                        <button className="w-full py-4 bg-surface border border-border-subtle hover:border-accent text-text-primary font-bold rounded-md transition-all flex items-center justify-center gap-3">
                            <span className="text-xl">💬</span> DISCORD SERVER
                        </button>
                        <button className="w-full py-4 bg-surface border border-border-subtle hover:border-accent text-text-primary font-bold rounded-md transition-all flex items-center justify-center gap-3">
                            <span className="text-xl">⭐</span> GITHUB REPOSITORY
                        </button>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 text-center">
                <h2 className="text-4xl font-bold text-text-primary mb-8 tracking-tight uppercase">Ready to transform your business?</h2>
                <Link to="/authentication" className="text-accent hover:text-accent-hover font-bold text-lg tracking-[0.2em] uppercase border-b-2 border-accent/20 hover:border-accent transition-all pb-2">
                    Establish Identity →
                </Link>
            </section>
        </div>
    );
};

export default HomePage;