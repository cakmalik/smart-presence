import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import schools from '@/routes/schools';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface School {
    id: number;
    name: string;
    code: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    status: 'active' | 'inactive';
    users_count: number;
    students_count: number;
    created_at: string;
}

interface PaginatedData {
    data: School[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function SchoolsIndex({ schools: schoolsData }: { schools: PaginatedData }) {
    const [search, setSearch] = useState('');

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus sekolah ini?')) {
            router.delete(schools.destroy.url(id));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sekolah', href: schools.index() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Sekolah" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Sekolah</h1>
                        <p className="text-muted-foreground">Kelola data sekolah yang terdaftar</p>
                    </div>
                    <Button asChild>
                        <Link href={schools.create()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Sekolah
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Sekolah</CardTitle>
                        <CardDescription>Total {schoolsData.total} sekolah terdaftar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari sekolah..."
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">Nama</th>
                                        <th className="px-4 py-2 text-left font-medium">Kode</th>
                                        <th className="px-4 py-2 text-left font-medium">Email</th>
                                        <th className="px-4 py-2 text-left font-medium">User</th>
                                        <th className="px-4 py-2 text-left font-medium">Siswa</th>
                                        <th className="px-4 py-2 text-left font-medium">Status</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schoolsData.data
                                        .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))
                                        .map((school) => (
                                            <tr key={school.id} className="border-b">
                                                <td className="px-4 py-2 font-medium">{school.name}</td>
                                                <td className="px-4 py-2">{school.code}</td>
                                                <td className="px-4 py-2">{school.email || '-'}</td>
                                                <td className="px-4 py-2">{school.users_count}</td>
                                                <td className="px-4 py-2">{school.students_count}</td>
                                                <td className="px-4 py-2">
                                                    <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                                                        {school.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={schools.edit.url(school.id)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(school.id)}>
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
                                Menampilkan {schoolsData.data.length} dari {schoolsData.total} data
                            </p>
                            <div className="flex gap-2">
                                {schoolsData.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(schoolsData.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {schoolsData.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(schoolsData.next_page_url)}>
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
