import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import reports from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

interface Classroom {
    id: number;
    name: string;
}

interface Attendance {
    student_name: string;
    classroom_name: string | null;
    nis: string | null;
    prayer_type: string;
    operator_name: string;
    attendance_date: string;
    attended_at: string;
}

interface PaginatedData {
    data: Attendance[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function ReportsPrayer({
    attendances,
    classrooms,
    filters,
    prayer_types,
}: {
    attendances: PaginatedData;
    classrooms: Classroom[];
    filters: { date_from?: string; date_to?: string; classroom_id?: string; prayer_type?: string; filter?: string };
    prayer_types: Record<string, string>;
}) {
    const currentFilter = filters.filter || 'present';

    const handleFilter = (key: string, value: string) => {
        router.get(
            reports.prayer(),
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        if (filters.classroom_id) params.set('classroom_id', filters.classroom_id);
        if (filters.prayer_type) params.set('prayer_type', filters.prayer_type);
        if (filters.filter) params.set('filter', filters.filter);
        window.location.href = `${reports.export.prayer.url()}?${params.toString()}`;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '/reports' },
        { title: 'Presensi Sholat Berjamaah', href: reports.prayer() },
    ];

    return (
        <>
            <Head title="Laporan Presensi Sholat Berjamaah" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Presensi Sholat Berjamaah</h1>
                        <p className="text-muted-foreground">Rekap presensi sholat berjamaah</p>
                    </div>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-5">
                            <div>
                                <Label htmlFor="date_from">Dari Tanggal</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    defaultValue={filters.date_from}
                                    onChange={(e) => handleFilter('date_from', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_to">Sampai Tanggal</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    defaultValue={filters.date_to}
                                    onChange={(e) => handleFilter('date_to', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="classroom_id">Kelas</Label>
                                <Select
                                    value={filters.classroom_id || 'all'}
                                    onValueChange={(value) => handleFilter('classroom_id', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelas</SelectItem>
                                        {classrooms.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="prayer_type">Jenis Sholat</Label>
                                <Select
                                    value={filters.prayer_type || 'all'}
                                    onValueChange={(value) => handleFilter('prayer_type', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Sholat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Sholat</SelectItem>
                                        {Object.entries(prayer_types).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="filter">Status</Label>
                                <Select
                                    value={currentFilter}
                                    onValueChange={(value) => handleFilter('filter', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Hadir</SelectItem>
                                        <SelectItem value="absent">Tidak Hadir</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Presensi</CardTitle>
                        <CardDescription>Total {attendances.total} record</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                                        {currentFilter === 'present' && (
                                            <th className="px-4 py-2 text-left font-medium">Waktu</th>
                                        )}
                                        <th className="px-4 py-2 text-left font-medium">Jenis Sholat</th>
                                        {currentFilter === 'absent' && (
                                            <th className="px-4 py-2 text-left font-medium">NIS</th>
                                        )}
                                        <th className="px-4 py-2 text-left font-medium">Nama Siswa</th>
                                        <th className="px-4 py-2 text-left font-medium">Kelas</th>
                                        {currentFilter === 'present' && (
                                            <th className="px-4 py-2 text-left font-medium">Operator</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                Tidak ada data
                                            </td>
                                        </tr>
                                    )}
                                    {attendances.data.map((att, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-4 py-2">{att.attendance_date}</td>
                                            {currentFilter === 'present' && (
                                                <td className="px-4 py-2">{att.attended_at}</td>
                                            )}
                                            <td className="px-4 py-2">
                                                <span className="font-medium">{att.prayer_type}</span>
                                            </td>
                                            {currentFilter === 'absent' && (
                                                <td className="px-4 py-2">{att.nis || '-'}</td>
                                            )}
                                            <td className="px-4 py-2 font-medium">{att.student_name}</td>
                                            <td className="px-4 py-2">{att.classroom_name || '-'}</td>
                                            {currentFilter === 'present' && (
                                                <td className="px-4 py-2">{att.operator_name}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {attendances.data.length} dari {attendances.total} data
                            </p>
                            <div className="flex gap-2">
                                {attendances.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(attendances.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {attendances.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(attendances.next_page_url)}>
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

ReportsPrayer.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '/reports' },
        { title: 'Presensi Sholat Berjamaah', href: reports.prayer() },
    ],
};
