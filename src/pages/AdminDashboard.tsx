import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvents } from '@/hooks/useEvents';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalendarDays, Ticket, IndianRupee, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const bookingTrend = [
  { month: 'Jan', bookings: 45 }, { month: 'Feb', bookings: 62 }, { month: 'Mar', bookings: 78 },
  { month: 'Apr', bookings: 95 }, { month: 'May', bookings: 132 }, { month: 'Jun', bookings: 108 },
];

const revenueTrend = [
  { month: 'Jan', revenue: 125000 }, { month: 'Feb', revenue: 185000 }, { month: 'Mar', revenue: 245000 },
  { month: 'Apr', revenue: 320000 }, { month: 'May', revenue: 485000 }, { month: 'Jun', revenue: 380000 },
];

const PIE_COLORS = ['hsl(18,90%,55%)', 'hsl(165,60%,40%)', 'hsl(220,60%,45%)', 'hsl(340,80%,55%)', 'hsl(45,90%,50%)', 'hsl(280,60%,50%)', 'hsl(120,40%,45%)', 'hsl(0,70%,55%)'];

const integrations = [
  { name: 'Database', status: 'connected' as const, detail: 'Lovable Cloud active' },
  { name: 'Stripe Payments', status: 'pending' as const, detail: 'Not configured yet' },
  { name: 'AI Search', status: 'fallback' as const, detail: 'Using local rules engine' },
];

export default function AdminDashboard() {
  const { data: dbEvents = [], isLoading } = useEvents();

  const categoryDist = dbEvents.reduce((acc, e) => {
    const existing = acc.find(a => a.name === e.category);
    if (existing) existing.value++;
    else acc.push({ name: e.category, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalRevenue = revenueTrend.reduce((s, r) => s + r.revenue, 0);
  const totalBookings = bookingTrend.reduce((s, b) => s + b.bookings, 0);

  if (isLoading) {
    return <div className="container py-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Ticket className="h-5 w-5" />} label="Total Events" value={dbEvents.length.toString()} />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Total Bookings" value={totalBookings.toString()} />
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Active Users" value="1,247" />
      </div>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Booking Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Category Distribution</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {dbEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.venue}, {event.city} · {event.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{event.category}</Badge>
                      <span className="text-sm font-medium">₹{event.price}</span>
                      <span className="text-xs text-muted-foreground">{event.availableSeats}/{event.totalSeats}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="pt-4">
          <div className="grid gap-4 max-w-lg">
            {integrations.map(int => (
              <Card key={int.name}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{int.name}</p>
                    <p className="text-sm text-muted-foreground">{int.detail}</p>
                  </div>
                  {int.status === 'connected' && <CheckCircle className="h-5 w-5 text-accent" />}
                  {int.status === 'pending' && <XCircle className="h-5 w-5 text-destructive" />}
                  {int.status === 'fallback' && <AlertTriangle className="h-5 w-5 text-primary" />}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
