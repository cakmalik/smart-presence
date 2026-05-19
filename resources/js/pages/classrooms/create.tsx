import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
import classrooms from '@/routes/classrooms';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
}

export default function ClassroomsCreate({ teachers }: { teachers: Teacher[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        grade: '',
        teacher_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(classrooms.store());
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kelas', href: classrooms.index() },
        { title: 'Tambah', href: classrooms.create() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={classrooms.index()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Kelas</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Kelas</CardTitle>
                        <CardDescription>Isi data kelas dengan lengkap</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">Nama Kelas</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Contoh: VII-A" />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="grade">Tingkat</Label>
                                    <Input id="grade" value={data.grade} onChange={(e) => setData('grade', e.target.value)} placeholder="Contoh: VII" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="teacher_id">Wali Kelas</Label>
                                <Select value={data.teacher_id} onValueChange={(value) => setData('teacher_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih wali kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tidak ada</SelectItem>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={String(teacher.id)}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={classrooms.index()}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" /> Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
