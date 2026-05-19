import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import students from '@/routes/students';
import type { BreadcrumbItem } from '@/types';

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    nis: string | null;
    nisn: string | null;
    name: string;
    classroom_id: number;
    qr_code: string | null;
    status: 'active' | 'inactive';
}

export default function StudentsEdit({ student, classrooms }: { student: Student; classrooms: Classroom[] }) {
    const { data, setData, put, processing, errors } = useForm({
        nis: student.nis || '',
        nisn: student.nisn || '',
        name: student.name,
        classroom_id: String(student.classroom_id),
        status: student.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(students.update.url(student.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Siswa', href: students.index() },
        { title: student.name, href: students.edit.url(student.id) },
    ];

    return (
        <>
            <Head title="Edit Siswa" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={students.index()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Siswa</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Siswa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="nis">NIS</Label>
                                    <Input id="nis" value={data.nis} onChange={(e) => setData('nis', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="nisn">NISN</Label>
                                    <Input id="nisn" value={data.nisn} onChange={(e) => setData('nisn', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="classroom_id">Kelas</Label>
                                    <Select value={data.classroom_id} onValueChange={(value) => setData('classroom_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.classroom_id && <p className="mt-1 text-sm text-red-500">{errors.classroom_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Nonaktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={students.index()}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" /> Perbarui
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentsEdit.layout = (page: any) => {
    const { student } = page.props;
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Siswa', href: students.index() },
                { title: student.name, href: students.edit.url(student.id) },
            ]}
        >
            {page}
        </AppLayout>
    );
};
