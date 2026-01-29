'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PrintButton } from '@/components/ui/print-button'
import { PrintLayout } from '@/components/fabtex/print/print-layout'
import { Truck, User, Building2 } from 'lucide-react'

interface DeliveryOrderDetailClientProps {
    deliveryOrder: any
}

export default function DeliveryOrderDetailClient({ deliveryOrder }: DeliveryOrderDetailClientProps) {
    const [copyType, setCopyType] = useState<'CUSTOMER' | 'OFFICE'>('CUSTOMER')

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
            {/* Header / Controls */}
            <div className="flex items-center justify-between print:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Order Preview</h2>
                        <p className="text-xs text-muted-foreground font-mono">{deliveryOrder.doNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex p-1 bg-muted rounded-lg mr-4 border">
                        <Button
                            variant={copyType === 'CUSTOMER' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCopyType('CUSTOMER')}
                            className="rounded-md px-4"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Customer Copy
                        </Button>
                        <Button
                            variant={copyType === 'OFFICE' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCopyType('OFFICE')}
                            className="rounded-md px-4"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Office Copy
                        </Button>
                    </div>
                    <PrintButton />
                </div>
            </div>

            {/* Print Layout */}
            <div className="flex justify-center">
                <div className="shadow-2xl border bg-white rounded-sm overflow-hidden scale-95 origin-top transition-transform hover:scale-100 duration-500">
                    <PrintLayout data={deliveryOrder} type="DO" copyType={copyType} />
                </div>
            </div>

            {/* Disclaimer for UI */}
            <div className="text-center text-xs text-muted-foreground pb-12 print:hidden italic">
                Professional Print Format with Godown & Packing Details.
            </div>
        </div>
    )
}
