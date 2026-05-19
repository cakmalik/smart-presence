import { Head, Link, usePage } from '@inertiajs/react';
import { School, Users, GraduationCap, CalendarDays, ScanLine, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import schools from '@/routes/schools';
import classrooms from '@/routes/classrooms';
import students from '@/routes/students';
import events from '@/routes/events';
import attendance from '@/routes/attendance';
import reports from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

interface DashboardProps {
    stats?: {
        total_schools?: number;
        total_students?: number;
        total_classrooms?: number;
        total_events?: number;
        today_prayer?: number;
        active_events?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

export default function Dashboard({ stats }: DashboardProps) {
    const { auth } = usePage().props as any;
    const roles = auth?.roles || [];
    const permissions = auth?.permissions || [];

    const quickLinks = [];

    if (roles.includes('superadmin')) {
        quickLinks.push(
            { title: 'Kelola Sekolah', href: schools.index(), icon: School, count: stats?.total_schools },
            { title: 'Total Siswa', href: students.index(), icon: GraduationCap, count: stats?.total_students },
        );
    }

    if (permissions.includes('manage classrooms')) {
        quickLinks.push({ title: 'Kelas', href: classrooms.index(), icon: Users, count: stats?.total_classrooms });
    }

    if (permissions.includes('manage events')) {
        quickLinks.push({ title: 'Event Aktif', href: events.index(), icon: CalendarDays, count: stats?.active_events });
    }

    if (permissions.includes('scan attendance')) {
        quickLinks.push(
            { title: 'Presensi Sholat Berjamaah', href: attendance.prayer(), icon: ScanLine },
            { title: 'Presensi Event', href: attendance.event(), icon: ScanLine },
        );
    }

    if (permissions.includes('view reports')) {
        quickLinks.push({ title: 'Laporan', href: reports.prayer(), icon: FileText });
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Selamat datang di Smart Presence</p>
                </div>

                {stats && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {stats.total_schools !== undefined && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Sekolah</CardTitle>
                                    <School className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_schools}</div>
                                </CardContent>
                            </Card>
                        )}
                        {stats.total_students !== undefined && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_students}</div>
                                </CardContent>
                            </Card>
                        )}
                        {stats.today_prayer !== undefined && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Presensi Sholat Hari Ini</CardTitle>
                                    <ScanLine className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.today_prayer}</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quickLinks.map((link) => (
                        <Card key={link.title} className="hover:bg-accent/50 transition-colors">
                            <Link href={link.href} className="block p-4">
                                <CardContent className="flex items-center gap-4 p-0">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <link.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{link.title}</p>
                                        {link.count !== undefined && (
                                            <p className="text-sm text-muted-foreground">{link.count}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
    ],
};
