import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import classrooms from '@/routes/classrooms';
import type { BreadcrumbItem } from '@/types';

interface Classroom {
    id: number;
    name: string;
    grade: string | null;
    teacher_name: string | null;
    school_name?: string | null;
    students_count: number;
    created_at: string;
}

interface PaginatedData {
    data: Classroom[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function ClassroomsIndex({ classrooms: classroomsData, isSuperadmin }: { classrooms: PaginatedData; isSuperadmin: boolean }) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
            router.delete(classrooms.destroy.url(id));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kelas', href: classrooms.index() },
    ];

    return (
        <>
            <Head title="Manajemen Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
                        <p className="text-muted-foreground">Kelola data kelas</p>
                    </div>
                    <Button asChild>
                        <Link href={classrooms.create()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kelas
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kelas</CardTitle>
                        <CardDescription>Total {classroomsData.total} kelas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        {isSuperadmin && <th className="px-4 py-2 text-left font-medium">Sekolah</th>}
                                        <th className="px-4 py-2 text-left font-medium">Nama Kelas</th>
                                        <th className="px-4 py-2 text-left font-medium">Tingkat</th>
                                        <th className="px-4 py-2 text-left font-medium">Wali Kelas</th>
                                        <th className="px-4 py-2 text-left font-medium">Jumlah Siswa</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classroomsData.data.map((classroom) => (
                                        <tr key={classroom.id} className="border-b">
                                            {isSuperadmin && <td className="px-4 py-2">{classroom.school_name || '-'}</td>}
                                            <td className="px-4 py-2 font-medium">{classroom.name}</td>
                                            <td className="px-4 py-2">{classroom.grade || '-'}</td>
                                            <td className="px-4 py-2">{classroom.teacher_name || '-'}</td>
                                            <td className="px-4 py-2">
                                                <Badge variant="secondary">{classroom.students_count} siswa</Badge>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={classrooms.edit.url(classroom.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(classroom.id)}>
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
                                Menampilkan {classroomsData.data.length} dari {classroomsData.total} data
                            </p>
                            <div className="flex gap-2">
                                {classroomsData.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(classroomsData.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {classroomsData.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(classroomsData.next_page_url)}>
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

ClassroomsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kelas', href: classrooms.index() },
    ],
};
