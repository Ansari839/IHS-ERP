import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"
import prisma from "@/lib/prisma"

import { getCurrentUser } from "@/lib/auth"
import { ApplicationsChart, PayrollChart, IncomeChart } from "@/components/dashboard/dashboard-charts"

export default async function Home() {
  const user = await getCurrentUser()

  // Fetch real data from database with parallel queries
  const [
    totalUsers,
    totalPosts,
    publishedPosts,
    todayPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({
      where: {
        id: {
          gte: 1, // This is a placeholder - adjust based on your actual data
        },
      },
    }),
  ])

  // Get recent posts for activity feed
  const recentPosts = await prisma.post.findMany({
    take: 4,
    orderBy: { id: 'desc' },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  })

  /* eslint-disable react/jsx-key */
  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      description: "Registered users",
      className: "bg-blue-100 dark:bg-blue-900/20",
      iconClassName: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Posts",
      value: todayPosts.toLocaleString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
      description: "Posts created",
      className: "bg-violet-100 dark:bg-violet-900/20",
      iconClassName: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Published Posts",
      value: publishedPosts.toLocaleString(),
      change: "+23.1%",
      trend: "up" as const,
      icon: Package,
      description: "Published content",
      className: "bg-emerald-100 dark:bg-emerald-900/20",
      iconClassName: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "All Posts",
      value: totalPosts.toLocaleString(),
      change: "-3.2%",
      trend: "down" as const,
      icon: DollarSign,
      description: "Total posts in system",
      className: "bg-amber-100 dark:bg-amber-900/20",
      iconClassName: "text-amber-600 dark:text-amber-400",
    },
  ]

  const recentActivities = recentPosts.map((post) => ({
    id: post.id,
    action: post.published ? `Published: ${post.title}` : `Draft: ${post.title}`,
    customer: post.author?.name || post.author?.email || "Unknown",
    time: `Post #${post.id}`,
  }))

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </div>
                <div className={`p-3 rounded-xl ${stat.className.replace('bg-gradient-to-br', 'bg-opacity-20').split(' ')[0]} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconClassName}`} />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-4">
                <span className={`flex items-center font-medium ${stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </span>
                <span className="text-muted-foreground">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Layout - Top Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="col-span-1">
          <ApplicationsChart />
        </div>
        <div className="col-span-1">
          <PayrollChart />
        </div>
        <div className="col-span-1">
          <IncomeChart />
        </div>
      </div>

      {/* Two Column Layout - Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.customer}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Payment Vouchers Table Mockup */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Payment Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">Request for FARS</span>
                    <span className="text-xs text-muted-foreground">25/10/2025</span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Revalidate data every 5 minutes
export const revalidate = 300
