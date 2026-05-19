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
import { dashboard, schools, classrooms, students, events, attendance, reports } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const roles = auth?.roles || [];
    const permissions = auth?.permissions || [];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (roles.includes('superadmin')) {
        mainNavItems.push({
            title: 'Sekolah',
            href: schools.index(),
            icon: School,
        });
    }

    if (permissions.includes('manage classrooms')) {
        mainNavItems.push({
            title: 'Kelas',
            href: classrooms.index(),
            icon: Users,
        });
    }

    if (permissions.includes('manage students')) {
        mainNavItems.push({
            title: 'Siswa',
            href: students.index(),
            icon: GraduationCap,
        });
    }

    if (permissions.includes('manage events')) {
        mainNavItems.push({
            title: 'Event',
            href: events.index(),
            icon: CalendarDays,
        });
    }

    if (permissions.includes('scan attendance')) {
        mainNavItems.push({
            title: 'Presensi Dhuhur',
            href: attendance.dhuhur(),
            icon: ScanLine,
        });
        mainNavItems.push({
            title: 'Presensi Event',
            href: attendance.event(),
            icon: ScanLine,
        });
    }

    if (permissions.includes('view reports')) {
        mainNavItems.push({
            title: 'Laporan',
            href: reports.dhuhur(),
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
