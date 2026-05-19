import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import events from '@/routes/events';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    created_at: string;
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

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    active: 'default',
    completed: 'outline',
    cancelled: 'destructive',
};

export default function EventsIndex({ events: eventsData }: { events: PaginatedData }) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            router.delete(events.destroy.url(id));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Event', href: events.index() },
    ];

    return (
        <>
            <Head title="Manajemen Event" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Event</h1>
                        <p className="text-muted-foreground">Kelola event sekolah</p>
                    </div>
                    <Button asChild>
                        <Link href={events.create()}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Event
                        </Link>
                    </Button>
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
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventsData.data.map((event) => (
                                        <tr key={event.id} className="border-b">
                                            <td className="px-4 py-2 font-medium">{event.name}</td>
                                            <td className="px-4 py-2">
                                                {event.start_date}
                                                {event.end_date && ` - ${event.end_date}`}
                                            </td>
                                            <td className="px-4 py-2">{event.location || '-'}</td>
                                            <td className="px-4 py-2">
                                                <Badge variant={statusVariants[event.status]}>
                                                    {statusLabels[event.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={events.edit.url(event.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Event', href: events.index() },
    ],
};
