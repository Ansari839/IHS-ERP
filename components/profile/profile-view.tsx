'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './profile-form';

interface ProfileViewProps {
    user: any;
    primaryRole: string;
    departmentName: string;
    employeeId: string;
    companyName: string;
    themeSettings: React.ReactNode;
}

export function ProfileView({ user, primaryRole, departmentName, employeeId, companyName, themeSettings }: ProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Helpers for Role Colors
    const getRoleColor = (role: string) => {
        if (role.includes('ADMIN')) return "bg-rose-500/10 text-rose-500 border-rose-200";
        if (role.includes('MANAGER')) return "bg-indigo-500/10 text-indigo-500 border-indigo-200";
        return "bg-emerald-500/10 text-emerald-500 border-emerald-200";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Flip Container */}
            <div className="relative w-full max-w-md perspective-1000 min-h-[500px]">
                <div className={`relative w-full transition-all duration-500 preserve-3d ${isEditing ? 'hidden' : 'block'}`}>
                    {/* View Mode: ID Card */}
                    <div className="relative overflow-hidden bg-card border-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-3xl backdrop-blur-md">

                        {/* ID Card Header - Lanyard Hole & Design */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/90 to-primary/60">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-20 h-8 bg-background rounded-full shadow-inner border border-border/5 flex items-center justify-center">
                                <div className="w-12 h-2 bg-muted-foreground/20 rounded-full"></div>
                            </div>
                        </div>

                        <div className="relative px-8 pb-8 pt-12 flex flex-col items-center">

                            {/* Avatar */}
                            <div className="mt-8 mb-4 p-1.5 bg-background rounded-full shadow-xl">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted relative">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name & Title */}
                            <div className="text-center space-y-1 mb-6">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h2>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(primaryRole)}`}>
                                    {primaryRole.replace(/_/g, " ")}
                                </div>
                            </div>

                            {/* ID Details Grid */}
                            <div className="w-full grid grid-cols-2 gap-4 text-sm mb-8 bg-muted/30 p-4 rounded-2xl border border-primary/5">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Department</span>
                                    <p className="font-medium flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        {departmentName}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold opacity-70">ID Number</span>
                                    <p className="font-mono font-medium">{employeeId}</p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Email</span>
                                    <p className="font-medium truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Footer / Company Info */}
                            <div className="w-full pt-6 border-t border-border/50 flex flex-col items-center gap-2 text-center group relative">
                                <p className="text-xs font-semibold text-primary/80 uppercase tracking-[0.2em]">{companyName}</p>
                                <div className="h-8 w-64 bg-foreground/10 rounded-sm flex items-center justify-center overflow-hidden opacity-50">
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <div key={i} style={{ width: Math.random() * 4 + 1 }} className="h-full bg-foreground mx-[1px]"></div>
                                    ))}
                                </div>

                                {/* Edit Button (Floating) */}
                                <Button
                                    size="sm"
                                    className="absolute -bottom-2 right-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="w-3 h-3 mr-1" /> Edit Profile
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Edit Mode: Profile Form */}
                <div className={`relative w-full animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 ${isEditing ? 'block' : 'hidden'}`}>
                    <div className="bg-card border-none shadow-xl rounded-3xl p-6 relative">
                        <ProfileForm user={user} onCancel={() => setIsEditing(false)} />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md">
                {themeSettings}
            </div>
        </div>
    );
}
