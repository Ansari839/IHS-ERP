'use client'

import React from 'react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PrintLayoutProps {
    data: any
    type: 'DO' | 'INVOICE'
    copyType: 'CUSTOMER' | 'OFFICE'
}

export function PrintLayout({ data, type, copyType }: PrintLayoutProps) {
    if (!data) return null

    const title = type === 'DO' ? 'Delivery Order' : 'Sales Invoice'
    const number = type === 'DO' ? data.doNumber : data.invoiceNumber
    const date = data.date ? format(new Date(data.date), 'dd-MMM-yyyy') : '-'
    const customer = data.account?.name || data.salesOrder?.account?.name || 'Cash Customer'
    const address = data.account?.description || data.salesOrder?.account?.description || '-'

    // Warehouse / Godown Details
    const warehouse = data.warehouse
    const warehouseRef = data.warehouseRefNo || '-'

    return (
        <div className="bg-white text-black p-8 font-serif max-w-[8.5in] mx-auto min-h-[11in] flex flex-col">
            {/* Copy Type Indicator */}
            <div className="text-right text-[10px] uppercase font-bold text-gray-400 mb-2">
                {copyType} COPY
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div className="flex-1">
                    {data.company?.logoUrl && (
                        <img src={data.company.logoUrl} alt="Logo" className="h-16 mb-2 object-contain" />
                    )}
                    <h1 className="text-2xl font-black uppercase tracking-tighter">{data.company?.legalName || 'FAB TEX'}</h1>
                    <p className="text-[10px] leading-tight max-w-xs">{data.company?.address}</p>
                    <p className="text-[10px]">{data.company?.email} | {data.company?.phone}</p>
                </div>
                <div className="text-right flex flex-col justify-between h-full">
                    <h2 className="text-4xl font-black uppercase text-gray-200 absolute right-8 top-12 -z-10 opacity-50">{title}</h2>
                    <div className="mt-8 space-y-1">
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold uppercase tracking-wider">{type} NO:</span>
                            <span className="font-black border-b border-black min-w-[120px] text-right">{number}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold uppercase tracking-wider">DATE:</span>
                            <span className="font-black border-b border-black min-w-[120px] text-right">{date}</span>
                        </div>
                        {data.salesOrder && (
                            <div className="flex justify-end gap-2 text-[10px]">
                                <span className="font-bold text-gray-500 uppercase">SO REF:</span>
                                <span className="font-bold">{data.salesOrder.soNumber}</span>
                            </div>
                        )}
                        {warehouseRef && (
                            <div className="flex justify-end gap-2 text-[10px]">
                                <span className="font-bold text-gray-500 uppercase italic">GODOWN REF:</span>
                                <span className="font-bold">{warehouseRef}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Parties Info */}
            <div className="grid grid-cols-2 gap-12 mb-8">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-1">CONSIGNEE / BILL TO</h4>
                        <div className="pl-2 border-l-2 border-gray-200">
                            <p className="font-black text-lg leading-tight uppercase">{customer}</p>
                            <p className="text-[11px] text-gray-700 whitespace-pre-wrap">{address}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {warehouse && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase bg-gray-200 text-black px-2 py-0.5 inline-block mb-1 italic">DISPATCHED FROM (GODOWN)</h4>
                            <div className="pl-2 border-l-2 border-gray-200">
                                <p className="font-black text-sm uppercase">{warehouse.name}</p>
                                <p className="text-[10px] text-gray-600 italic leading-tight">{warehouse.location}</p>
                                {warehouse.contactNumbers?.length > 0 && (
                                    <p className="text-[10px] font-bold mt-1 tracking-tighter">PH: {warehouse.contactNumbers.join(', ')}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1">
                <table className="w-full border-collapse border-y-2 border-black">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase font-black text-left">
                            <th className="border-b border-black p-2">DESCRIPTION OF GOODS</th>
                            <th className="border-b border-black p-2 text-center w-24">PACKING</th>
                            <th className="border-b border-black p-2 text-center w-20">PKGS</th>
                            <th className="border-b border-black p-2 text-center w-20">SIZE</th>
                            <th className="border-b border-black p-2 text-right w-32">QUANTITY</th>
                            {type === 'INVOICE' && (
                                <>
                                    <th className="border-b border-black p-2 text-right w-24">RATE</th>
                                    <th className="border-b border-black p-2 text-right w-32">AMOUNT</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-[11px]">
                        {data.items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-black">
                                <td className="p-2">
                                    <div className="font-black text-sm uppercase">{item.itemMaster?.name}</div>
                                    <div className="flex gap-4 text-[9px] text-gray-500 font-bold uppercase mt-0.5">
                                        {item.brand && <span>BRAND: {item.brand.name}</span>}
                                        {item.color && <span>COLOR: {item.color.name}</span>}
                                        {item.itemGrade && <span>GRADE: {item.itemGrade.name}</span>}
                                    </div>
                                </td>
                                <td className="p-2 text-center text-[10px] font-bold uppercase tracking-tighter">
                                    {item.packingType || 'EVEN'}
                                </td>
                                <td className="p-2 text-center font-black">
                                    {item.pcs || '-'}
                                </td>
                                <td className="p-2 text-center font-bold italic">
                                    {item.unitSize || '-'}
                                </td>
                                <td className="p-2 text-right font-black text-sm">
                                    {type === 'DO' ? item.deliveredQty : item.invoicedQty}
                                    <span className="text-[9px] ml-1 font-bold text-gray-400 uppercase tracking-widest">{item.unit?.symbol || 'KG'}</span>
                                </td>
                                {type === 'INVOICE' && (
                                    <>
                                        <td className="p-2 text-right font-bold italic">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.rate)}
                                        </td>
                                        <td className="p-2 text-right font-black text-sm">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.amount)}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary / Total */}
                <div className="flex justify-end mt-4">
                    <div className="w-[300px] space-y-1">
                        {type === 'INVOICE' && (
                            <div className="flex justify-between items-center py-2 px-2 bg-black text-white">
                                <span className="font-black uppercase text-xs tracking-widest">Grand Total (PKR)</span>
                                <span className="font-black text-lg">
                                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(data.totalAmount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-[11px] font-bold px-2">
                            <span className="uppercase text-gray-500">TOTAL PACKAGES:</span>
                            <span>{data.items.reduce((sum: number, it: any) => sum + (it.pcs || 0), 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20">
                {data.remarks && (
                    <div className="mb-12">
                        <h4 className="text-[9px] font-black uppercase text-gray-400 border-b inline-block mb-1">REMARKS / NOTES</h4>
                        <p className="text-[11px] italic leading-relaxed">{data.remarks}</p>
                    </div>
                )}

                <div className="flex justify-between items-end mt-12 pb-2">
                    <div className="flex flex-col items-center">
                        <div className="w-40 border-b-2 border-black mb-2"></div>
                        <span className="text-[10px] font-black uppercase">PREPARED BY</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-40 border-b-2 border-black mb-2"></div>
                        <span className="text-[10px] font-black uppercase">CHECKED BY</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-40 border-b-2 border-black mb-2"></div>
                        <span className="text-[10px] font-black uppercase">AUTHORIZED SIGNATORY</span>
                    </div>
                </div>

                <div className="mt-8 text-center text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] border-t pt-2">
                    Computer Generated Document - No Signature Required Unless Specified
                </div>
            </div>
        </div>
    )
}
