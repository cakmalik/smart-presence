import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { BreadcrumbItem } from '@/types';

interface PrayerType {
    prayer_type: string;
    label: string;
    start_time: string;
    end_time: string;
}

interface School {
    id: number;
    name: string;
}

export default function PrayerTimes({
    prayer_types,
    school_id,
    school,
    schools,
}: {
    prayer_types: PrayerType[];
    school_id: number | null;
    school: School | null;
    schools: School[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        school_id: String(school_id || ''),
        prayer_types: prayer_types.map((pt) => ({
            prayer_type: pt.prayer_type,
            label: pt.label,
            start_time: pt.start_time,
            end_time: pt.end_time,
        })),
    });

    const handlePrayerChange = (index: number, field: string, value: string) => {
        setData('prayer_types', data.prayer_types.map((pt, i) =>
            i === index ? { ...pt, [field]: value } : pt
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/prayer-times', { preserveState: true });
    };

    const handleSchoolChange = (value: string) => {
        setData('school_id', value);
        router.get('/settings/prayer-times', { school_id: value }, { preserveState: true });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pengaturan Jadwal Sholat', href: '/settings/prayer-times' },
    ];

    return (
        <>
            <Head title="Jadwal Sholat" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/settings/profile">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Jadwal Sholat Berjamaah</h1>
                        <p className="text-muted-foreground">Atur jam pelaksanaan sholat berjamaah</p>
                    </div>
                </div>

                {schools.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sekolah</CardTitle>
                            <CardDescription>Pilih sekolah untuk mengatur jadwal sholat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={data.school_id} onValueChange={handleSchoolChange}>
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
                        </CardContent>
                    </Card>
                )}

                {school && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Jadwal Sholat — {school.name}
                            </CardTitle>
                            <CardDescription>
                                Atur jadwal sholat berjamaah untuk sekolah ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {data.prayer_types.map((pt, index) => (
                                    <div key={pt.prayer_type} className="rounded-lg border p-4">
                                        <h3 className="mb-3 font-medium">{pt.label}</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor={`start-${index}`}>Jam Mulai</Label>
                                                <Input
                                                    id={`start-${index}`}
                                                    type="time"
                                                    value={pt.start_time}
                                                    onChange={(e) => handlePrayerChange(index, 'start_time', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`end-${index}`}>Jam Selesai</Label>
                                                <Input
                                                    id={`end-${index}`}
                                                    type="time"
                                                    value={pt.end_time}
                                                    onChange={(e) => handlePrayerChange(index, 'end_time', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {errors[`prayer_types.${index}.start_time`] && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors[`prayer_types.${index}.start_time`]}
                                            </p>
                                        )}
                                        {errors[`prayer_types.${index}.end_time`] && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors[`prayer_types.${index}.end_time`]}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Jadwal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
