import React from 'react';

export const PageHeader = ({ title, subtitle, actionLabel, onAction }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-sans font-bold tracking-tight text-text-primary uppercase">{title}</h1>
            {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
        </div>
        {actionLabel && (
            <button 
                onClick={onAction}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all shadow-lg hover:shadow-accent/20 min-h-[44px] flex items-center justify-center uppercase tracking-wider text-sm"
            >
                {actionLabel}
            </button>
        )}
    </div>
);

export const ContentCard = ({ children, noPadding = false, className = "" }) => (
    <div className={`bg-surface border border-border-subtle rounded-md overflow-hidden ${!noPadding ? 'p-6' : ''} ${className}`}>
        {children}
    </div>
);

export const StatusBadge = ({ children, color = "accent" }) => {
    const colors = {
        accent: "bg-accent/10 text-accent border-accent/20",
        success: "bg-success/10 text-success border-success/20",
        danger: "bg-danger/10 text-danger border-danger/20",
        warning: "bg-warning/10 text-warning border-warning/20",
    };
    
    return (
        <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider border rounded uppercase ${colors[color] || colors.accent}`}>
            {children}
        </span>
    );
};

export const Banner = ({ title, subtitle, tag }) => (
    <div className="bg-surface-elevated border border-border-subtle p-8 md:p-10 rounded-lg relative overflow-hidden mb-10">
        {tag && (
            <div className="absolute top-0 right-0 p-6 opacity-5 font-display text-5xl md:text-7xl pointer-events-none select-none">
                {tag.toUpperCase()}
            </div>
        )}
        <h1 className="text-4xl md:text-5xl font-sans font-bold text-accent mb-4 uppercase tracking-tight">{title}</h1>
        <p className="text-text-secondary text-lg max-w-3xl leading-relaxed font-medium">{subtitle}</p>
    </div>
);
