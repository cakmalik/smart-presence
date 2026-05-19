import { Head, router } from '@inertiajs/react';
import { Download, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import reports from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    start_date: string;
    location: string | null;
    status: string;
    attendances_count: number;
}

interface PaginatedData {
    data: Event[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    active: 'Aktif',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function ReportsEvent({ events: eventsData }: { events: PaginatedData }) {
    const handleExport = (eventId: number) => {
        window.location.href = reports.export.event.url(eventId);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '/reports' },
        { title: 'Presensi Event', href: reports.event() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Presensi Event" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Laporan Presensi Event</h1>
                    <p className="text-muted-foreground">Rekap presensi event sekolah</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Event</CardTitle>
                        <CardDescription>Total {eventsData.total} event</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">Nama Event</th>
                                        <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                                        <th className="px-4 py-2 text-left font-medium">Lokasi</th>
                                        <th className="px-4 py-2 text-left font-medium">Status</th>
                                        <th className="px-4 py-2 text-left font-medium">Hadir</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventsData.data.map((event) => (
                                        <tr key={event.id} className="border-b">
                                            <td className="px-4 py-2 font-medium">{event.name}</td>
                                            <td className="px-4 py-2">{event.start_date}</td>
                                            <td className="px-4 py-2">{event.location || '-'}</td>
                                            <td className="px-4 py-2">
                                                <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                                                    {statusLabels[event.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2">{event.attendances_count} siswa</td>
                                            <td className="px-4 py-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleExport(event.id)}>
                                                    <Download className="mr-2 h-4 w-4" /> Export
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {eventsData.data.length} dari {eventsData.total} data
                            </p>
                            <div className="flex gap-2">
                                {eventsData.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(eventsData.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {eventsData.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(eventsData.next_page_url)}>
                                        Selanjutnya
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
