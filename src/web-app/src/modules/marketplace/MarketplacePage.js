import React, { useState } from 'react';
import { Card, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const MOCK_PROJECTS = [
    { id: 1, name: 'E-Commerce Core', description: 'Basic shopping cart, product catalog, and order management.', domain: 'Retail' },
    { id: 2, name: 'Healthcare Portal', description: 'Patient records, appointment scheduling, and telemedicine stubs.', domain: 'HealthTech' },
    { id: 3, name: 'Fintech Wallet', description: 'Ledger management, KYC flow, and transaction histories.', domain: 'Fintech' }
];

const MarketplacePage = () => {
    const navigate = useNavigate();
    const [instantiating, setInstantiating] = useState(null);

    const handleInstantiate = (projectId) => {
        setInstantiating(projectId);
        setTimeout(() => {
            // Mock instantiation complete, redirect to solutions
            navigate('/solutions');
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Marketplace</h1>
                    <p className="text-text-secondary mt-2">Browse and instantiate pre-built architectural templates.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PROJECTS.map(project => (
                    <Card key={project.id} className="bg-surface-elevated border-border-subtle hover:border-accent transition-colors duration-300">
                        <div className="flex flex-col h-full justify-between space-y-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2 block">{project.domain}</span>
                                <h5 className="text-xl font-bold text-text-primary mb-2">{project.name}</h5>
                                <p className="font-normal text-text-secondary text-sm">
                                    {project.description}
                                </p>
                            </div>
                            <Button 
                                onClick={() => handleInstantiate(project.id)}
                                disabled={instantiating === project.id}
                                className="w-full bg-accent hover:bg-accent-hover text-background font-bold tracking-widest uppercase transition-all"
                            >
                                {instantiating === project.id ? 'Instantiating...' : 'Use Template'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MarketplacePage;
