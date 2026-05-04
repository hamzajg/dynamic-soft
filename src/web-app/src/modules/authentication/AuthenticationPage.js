import React from "react";
import {TextInput} from "flowbite-react";
import {Link} from "react-router-dom";

const AuthenticationPage = () =>{
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-fade-in">
            <div className="w-full max-w-md bg-surface border border-border-subtle p-10 rounded-lg shadow-2xl shadow-black/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
                
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-sans font-bold text-text-primary tracking-tight mb-2 uppercase">Welcome Back</h1>
                    <p className="text-text-tertiary text-sm font-medium tracking-wide">Enter your credentials to access the grid.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] ml-1">Email Identity</label>
                        <TextInput 
                            type="email" 
                            placeholder="user@dynamicsoft.cloud"
                            required
                            theme={{
                                field: {
                                    input: {
                                        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                                        colors: {
                                            gray: "bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/30"
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] ml-1">Secure Key</label>
                        <TextInput 
                            type="password" 
                            placeholder="••••••••"
                            required
                            theme={{
                                field: {
                                    input: {
                                        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                                        colors: {
                                            gray: "bg-surface-elevated border-border-subtle text-text-primary focus:border-accent focus:ring-accent/20 placeholder-text-tertiary/30"
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center">
                            <input id="remember" type="checkbox" className="w-4 h-4 rounded-sm border-border-subtle bg-surface-elevated text-accent focus:ring-accent/20 focus:ring-offset-background" />
                            <label htmlFor="remember" className="ml-2 text-xs text-text-secondary font-medium">Remember me</label>
                        </div>
                        <a href="#" className="text-xs text-accent hover:text-accent-hover font-bold uppercase tracking-wider transition-colors">Forgot key?</a>
                    </div>

                    <div className="pt-6">
                        <Link to="/" className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-bold rounded-sm transition-all shadow-lg hover:shadow-accent/30 min-h-[44px] flex items-center justify-center uppercase tracking-[0.15em] text-sm">
                            Authorize Access
                        </Link>
                    </div>
                </form>

                <div className="mt-10 pt-8 border-t border-border-subtle text-center">
                    <p className="text-text-tertiary text-xs font-medium">
                        New to the ecosystem? <a href="#" className="text-accent hover:text-accent-hover font-bold transition-colors">Create Identity</a>
                    </p>
                </div>
            </div>
            
            <div className="mt-8 flex items-center space-x-6">
                <span className="text-[10px] font-bold text-text-disabled uppercase tracking-widest">v2.0 Stable Build</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                <span className="text-[10px] font-bold text-text-disabled uppercase tracking-widest">Secure Handshake: OK</span>
            </div>
        </div>
    );
};

export default AuthenticationPage;