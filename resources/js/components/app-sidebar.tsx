import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, School, Users, GraduationCap, CalendarDays, ScanLine, FileText } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import schools from '@/routes/schools';
import classrooms from '@/routes/classrooms';
import students from '@/routes/students';
import events from '@/routes/events';
import attendance from '@/routes/attendance';
import reports from '@/routes/reports';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const roles = auth?.roles || [];
    const permissions = auth?.permissions || [];

    const overviewNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    const masterNavItems: NavItem[] = [];
    if (roles.includes('superadmin')) {
        masterNavItems.push({
            title: 'Sekolah',
            href: schools.index(),
            icon: School,
        });
    }

    if (permissions.includes('manage classrooms')) {
        masterNavItems.push({
            title: 'Kelas',
            href: classrooms.index(),
            icon: Users,
        });
    }

    if (permissions.includes('manage students')) {
        masterNavItems.push({
            title: 'Siswa',
            href: students.index(),
            icon: GraduationCap,
        });
    }

    const attendanceNavItems: NavItem[] = [];
    if (permissions.includes('manage events')) {
        attendanceNavItems.push({
            title: 'Event',
            href: events.index(),
            icon: CalendarDays,
        });
    }

    if (permissions.includes('scan attendance')) {
        attendanceNavItems.push({
            title: 'Presensi Dhuhur',
            href: attendance.dhuhur(),
            icon: ScanLine,
        });
        attendanceNavItems.push({
            title: 'Presensi Event',
            href: attendance.event(),
            icon: ScanLine,
        });
    }

    const reportNavItems: NavItem[] = [];
    if (permissions.includes('view reports')) {
        reportNavItems.push({
            title: 'Laporan Dhuhur',
            href: reports.dhuhur(),
            icon: FileText,
        });
        reportNavItems.push({
            title: 'Laporan Event',
            href: reports.event(),
            icon: FileText,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Utama" items={overviewNavItems} />
                <NavMain label="Data Master" items={masterNavItems} />
                <NavMain label="Presensi" items={attendanceNavItems} />
                <NavMain label="Laporan" items={reportNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
