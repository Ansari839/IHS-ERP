import { DashboardLayout } from "@/components/dashboard-layout"
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

export default async function Home() {
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

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Posts",
      value: todayPosts.toLocaleString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
      description: "Posts created",
    },
    {
      title: "Published Posts",
      value: publishedPosts.toLocaleString(),
      change: "+23.1%",
      trend: "up" as const,
      icon: Package,
      description: "Published content",
    },
    {
      title: "All Posts",
      value: totalPosts.toLocaleString(),
      change: "-3.2%",
      trend: "down" as const,
      icon: DollarSign,
      description: "Total posts in system",
    },
  ]

  const recentActivities = recentPosts.map((post) => ({
    id: post.id,
    action: post.published ? `Published: ${post.title}` : `Draft: ${post.title}`,
    customer: post.author?.name || post.author?.email || "Unknown",
    time: `Post #${post.id}`,
  }))

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
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

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                <p className="font-medium text-sm">Create New Order</p>
                <p className="text-xs text-muted-foreground">Start a new sales order</p>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <p className="font-medium text-sm">Add Product</p>
                <p className="text-xs text-muted-foreground">Add new product to inventory</p>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <p className="font-medium text-sm">Generate Report</p>
                <p className="text-xs text-muted-foreground">Create sales or inventory report</p>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <p className="font-medium text-sm">Manage Customers</p>
                <p className="text-xs text-muted-foreground">View and edit customer data</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Chart visualization coming soon</p>
              <p className="text-xs mt-1">Integrate with your preferred charting library</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}

// Revalidate data every 5 minutes
export const revalidate = 300
