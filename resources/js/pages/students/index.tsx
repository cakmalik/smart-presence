import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, QrCode, Upload } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import students from '@/routes/students';
import type { BreadcrumbItem } from '@/types';
import { useRef } from 'react';

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    nis: string | null;
    nisn: string | null;
    name: string;
    classroom: string | null;
    qr_code: string | null;
    status: 'active' | 'inactive';
    created_at: string;
}

interface PaginatedData {
    data: Student[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function StudentsIndex({
    students: studentsData,
    classrooms,
    filters,
}: {
    students: PaginatedData;
    classrooms: Classroom[];
    filters: { search?: string; classroom_id?: string };
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { setData: setImportData, post: postImport, processing: importProcessing } = useForm({
        file: null as File | null,
    });

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            router.delete(students.destroy.url(id));
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportData('file', file);
            postImport(students.import(), {
                forceFormData: true,
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Siswa', href: students.index() },
    ];

    return (
        <>
            <Head title="Manajemen Siswa" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
                        <p className="text-muted-foreground">Kelola data siswa</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importProcessing}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
                        <Button asChild>
                            <Link href={students.create()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Siswa
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Siswa</CardTitle>
                        <CardDescription>Total {studentsData.total} siswa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari siswa..."
                                    className="pl-10"
                                    defaultValue={filters.search}
                                    onChange={(e) => router.get(students.index(), { search: e.target.value, classroom_id: filters.classroom_id }, { preserveState: true })}
                                />
                            </div>
                            <Select
                                value={filters.classroom_id || 'all'}
                                onValueChange={(value) => router.get(students.index(), { search: filters.search, classroom_id: value === 'all' ? '' : value }, { preserveState: true })}
                            >
                                <SelectTrigger className="w-[200px]">
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

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">NIS</th>
                                        <th className="px-4 py-2 text-left font-medium">Nama</th>
                                        <th className="px-4 py-2 text-left font-medium">Kelas</th>
                                        <th className="px-4 py-2 text-left font-medium">Status</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsData.data.map((student) => (
                                        <tr key={student.id} className="border-b">
                                            <td className="px-4 py-2">{student.nis || '-'}</td>
                                            <td className="px-4 py-2 font-medium">{student.name}</td>
                                            <td className="px-4 py-2">{student.classroom || '-'}</td>
                                            <td className="px-4 py-2">
                                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                    {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={students.qr.url(student.id)}>
                                                            <QrCode className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={students.edit.url(student.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
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
                                Menampilkan {studentsData.data.length} dari {studentsData.total} data
                            </p>
                            <div className="flex gap-2">
                                {studentsData.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(studentsData.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {studentsData.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(studentsData.next_page_url)}>
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

StudentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Siswa', href: students.index() },
    ],
};
