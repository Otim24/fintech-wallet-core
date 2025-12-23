import { ArrowRightLeft, Plus, FileText, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions() {
    const actions = [
        { label: 'Transfer', icon: ArrowRightLeft, color: 'bg-blue-600' },
        { label: 'Add Money', icon: Plus, color: 'bg-green-600' },
        { label: 'Bill Pay', icon: Smartphone, color: 'bg-orange-500' },
        { label: 'Statement', icon: FileText, color: 'bg-purple-600' },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 p-4 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border-0 transition-colors duration-300">
            {actions.map((action) => (
                <div key={action.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className={`${action.color} h-14 w-14 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105`}>
                        <action.icon size={24} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">{action.label}</span>
                </div>
            ))}
        </div>
    );
}
