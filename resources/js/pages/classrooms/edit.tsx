import { useEffect } from 'react';
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

interface Classroom {
    id: number;
    name: string;
    grade: string | null;
    teacher_id: number | null;
    school_id: number;
}

interface School {
    id: number;
    name: string;
}

export default function ClassroomsEdit({ classroom, teachers, schools }: { classroom: Classroom; teachers: Teacher[]; schools: School[] }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        name: classroom.name,
        grade: classroom.grade || '',
        teacher_id: classroom.teacher_id ? String(classroom.teacher_id) : 'none',
        school_id: classroom.school_id ? String(classroom.school_id) : '',
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            teacher_id: data.teacher_id === 'none' ? '' : data.teacher_id,
        }));
    }, [transform]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(classrooms.update.url(classroom.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kelas', href: classrooms.index() },
        { title: classroom.name, href: classrooms.edit.url(classroom.id) },
    ];

    return (
        <>
            <Head title="Edit Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={classrooms.index()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Kelas</h1>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {schools && schools.length > 0 && (
                                <div>
                                    <Label htmlFor="school_id">Sekolah</Label>
                                    <Select value={data.school_id} onValueChange={(value) => setData('school_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih sekolah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schools.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.school_id && <p className="mt-1 text-sm text-red-500">{errors.school_id}</p>}
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">Nama Kelas</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="grade">Tingkat</Label>
                                    <Input id="grade" value={data.grade} onChange={(e) => setData('grade', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="teacher_id">Wali Kelas</Label>
                                <Select value={data.teacher_id} onValueChange={(value) => setData('teacher_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih wali kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
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

ClassroomsEdit.layout = (page: any) => {
    const { classroom } = page.props;
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Kelas', href: classrooms.index() },
                { title: classroom.name, href: classrooms.edit.url(classroom.id) },
            ]}
        >
            {page}
        </AppLayout>
    );
};
