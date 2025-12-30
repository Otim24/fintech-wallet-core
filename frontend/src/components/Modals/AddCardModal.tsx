'use client'
import { useState } from 'react'
import { Loader2, Smartphone, CreditCard } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import api from '@/lib/api'

interface AddCardModalProps {
    children: React.ReactNode;
    onSuccess?: () => void;
}


export function AddCardModal({ children, onSuccess }: AddCardModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState<string | null>(null) // 'VIRTUAL' | 'PHYSICAL' | null

    const handleCreate = async (type: 'VIRTUAL' | 'PHYSICAL') => {
        setLoading(type)
        try {
            await api.post('/ledger/cards/', { type })

            toast.success(`${type === 'VIRTUAL' ? 'Virtual' : 'Physical'} Card Issued Successfully!`)
            if (onSuccess) onSuccess()
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to issue card. Please try again.")
        } finally {
            setLoading(null)
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-3xl p-0 overflow-hidden">
                <div className="p-8 text-center border-b border-zinc-800 bg-zinc-900/50">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-extrabold mb-2">Select Card Type</DialogTitle>
                        <p className="text-zinc-400">Choose the card that fits your lifestyle.</p>
                    </DialogHeader>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* OPTION 1: VIRTUAL */}
                    <button
                        disabled={!!loading}
                        onClick={() => handleCreate('VIRTUAL')}
                        className="group relative h-80 p-8 text-left transition-all hover:bg-zinc-900 focus:outline-none border-r border-zinc-800 flex flex-col items-center text-center"
                    >
                        <div className="relative w-full aspect-[1.586] rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 shadow-2xl mb-8 group-hover:scale-105 transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <Smartphone className="w-6 h-6 text-emerald-950" />
                                <span className="text-[10px] font-bold bg-emerald-950/20 px-2 py-0.5 rounded text-emerald-950">GHOST</span>
                            </div>
                            <div className="text-emerald-950 font-mono text-lg tracking-widest mt-8">
                                **** **** **** 4242
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Virtual / Ghost</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Instantly active. Secure for online shopping with dynamic CVV.
                            </p>
                        </div>

                        {loading === 'VIRTUAL' && (
                            <div className="mt-6 flex items-center text-emerald-500 font-bold animate-pulse">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Issuing...
                            </div>
                        )}
                    </button>

                    {/* OPTION 2: PHYSICAL */}
                    <button
                        disabled={!!loading}
                        onClick={() => handleCreate('PHYSICAL')}
                        className="group relative h-80 p-8 text-left transition-all hover:bg-zinc-900 focus:outline-none flex flex-col items-center text-center"
                    >
                        <div className="relative w-full aspect-[1.586] rounded-xl bg-[#1a1a1a] border border-zinc-700 p-6 shadow-xl mb-8 group-hover:scale-105 transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <CreditCard className="w-6 h-6 text-zinc-400" />
                                <span className="text-[10px] font-bold bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">METAL</span>
                            </div>
                            <div className="text-zinc-500 font-mono text-lg tracking-widest mt-8">
                                **** **** **** 8888
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Physical / Metal</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Premium metal finish. ATM access worldwide with lower fees.
                            </p>
                        </div>

                        {loading === 'PHYSICAL' && (
                            <div className="mt-6 flex items-center text-white font-bold animate-pulse">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                            </div>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
