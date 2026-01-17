"use client"

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreVertical } from "lucide-react"

// --- Mock Data ---
const applicationsData = [
    { name: "Pending", value: 100, color: "#8b5cf6" }, // Violet
    { name: "Approved", value: 60, color: "#f59e0b" }, // Amber
    { name: "Rejected", value: 40, color: "#10b981" }, // Emerald
]

const payrollData = [
    { name: "Jan", net: 4000, tax: 2400 },
    { name: "Feb", net: 3000, tax: 1398 },
    { name: "Mar", net: 2000, tax: 9800 },
    { name: "Apr", net: 2780, tax: 3908 },
    { name: "May", net: 1890, tax: 4800 },
    { name: "Jun", net: 2390, tax: 3800 },
]

const incomeData = [
    { name: "Sep", value: 2000 },
    { name: "Oct 10", value: 4500 },
    { name: "Oct 20", value: 3800 },
    { name: "Oct 30", value: 8900 },
    { name: "Nov 10", value: 11800 },
]

// --- Components ---

export function ApplicationsChart() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                    Staff applications card
                </CardTitle>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={applicationsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {applicationsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold">200</span>
                        <span className="text-xs text-muted-foreground">Total application</span>
                    </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    {applicationsData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <span className="text-lg font-bold" style={{ color: item.color }}>{item.value}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-muted-foreground">{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function PayrollChart() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                    Annual payroll summary
                </CardTitle>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={payrollData} barGap={8}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="net" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
                            <Bar dataKey="tax" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500" />
                        <span className="text-xs text-muted-foreground">Net Salary</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-violet-500" />
                        <span className="text-xs text-muted-foreground">Tax</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function IncomeChart() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">
                        Total income
                    </CardTitle>
                    <div className="mt-1">
                        <span className="text-2xl font-bold">$11,800.00</span>
                        <span className="ml-2 text-xs font-medium text-emerald-500">↑ 21% vs last month</span>
                    </div>
                </div>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={incomeData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
