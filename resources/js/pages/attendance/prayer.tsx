import { Head, router } from '@inertiajs/react';
import { Scan, CheckCircle, XCircle, Clock, Search, Loader2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import attendance from '@/routes/attendance';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface RecentAttendance {
    student_name: string;
    prayer_type: string;
    operator_name: string;
    attended_at: string;
}

interface PrayerTimes {
    [key: string]: {
        label: string;
        start_time: string;
        end_time: string;
    };
}

interface StudentResult {
    id: number;
    name: string;
    nis: string | null;
    classroom: string | null;
}

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

async function apiPost(url: string, data: Record<string, unknown>) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
    });
}

export default function AttendancePrayer({
    recent_attendances,
    today_count,
    current_prayer,
    prayer_label,
    prayer_times = {},
}: {
    recent_attendances: RecentAttendance[];
    today_count: number;
    current_prayer: string | null;
    prayer_label: string | null;
    prayer_times: PrayerTimes;
}) {
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    const [pendingConfirmation, setPendingConfirmation] = useState<{
        qrCode: string;
        student: { name: string; nis: string | null; classroom: string | null };
    } | null>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
    const [isSearchingStudents, setIsSearchingStudents] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const startScanner = async () => {
        if (!scannerContainerRef.current) return;

        scannerRef.current = new Html5Qrcode('qr-reader');

        try {
            await scannerRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await onQrDetected(decodedText);
                },
                () => {}
            );
            setIsScanning(true);
        } catch (err) {
            console.error('Scanner error:', err);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            await scannerRef.current.stop();
            setIsScanning(false);
        }
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const onQrDetected = async (decodedText: string) => {
        if (isLookingUp || pendingConfirmation) return;

        await stopScanner();
        setIsLookingUp(true);
        setLookupError(null);

        try {
            const res = await fetch(attendance.scan.url(decodedText));
            const data = await res.json();

            if (!data.found || !data.student) {
                setLookupError('Siswa tidak ditemukan atau tidak aktif.');
                return;
            }

            setPendingConfirmation({
                qrCode: decodedText,
                student: data.student,
            });
        } catch {
            setLookupError('Gagal memuat data siswa.');
        } finally {
            setIsLookingUp(false);
        }
    };

    const confirmAttendance = async () => {
        if (!pendingConfirmation) return;
        setIsSubmitting(true);

        try {
            const res = await apiPost(attendance.prayer.store.url(), { qr_code: pendingConfirmation.qrCode });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message, {
                    description: data.data
                        ? `${data.data.student_name} · ${data.data.prayer_type} · ${data.data.attended_at}`
                        : undefined,
                });
                setTimeout(() => router.reload(), 1500);
            } else {
                toast.error(data.message || 'Presensi gagal');
            }
        } catch {
            toast.error('Gagal terhubung ke server.');
        } finally {
            setIsSubmitting(false);
            setPendingConfirmation(null);
        }
    };

    const cancelConfirmation = () => {
        setPendingConfirmation(null);
        setLookupError(null);
        startScanner();
    };

    const dismissError = () => {
        setLookupError(null);
        startScanner();
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);

            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsSearchingStudents(true);
            try {
                const res = await fetch(`${attendance.prayer.search.url()}?q=${encodeURIComponent(value)}`);
                const data = await res.json();
                setSearchResults(data.data || []);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearchingStudents(false);
            }
        }, 300);
    };

    const submitByStudentId = async (studentId: number) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await apiPost(attendance.prayer.store.url(), { student_id: studentId });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message, {
                    description: data.data
                        ? `${data.data.student_name} · ${data.data.prayer_type} · ${data.data.attended_at}`
                        : undefined,
                });
                setSearchQuery('');
                setSearchResults([]);
                setTimeout(() => router.reload(), 1500);
            } else {
                toast.error(data.message || 'Presensi gagal');
            }
        } catch {
            toast.error('Gagal terhubung ke server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Presensi Sholat Berjamaah', href: attendance.prayer() },
    ];

    return (
        <>
            <Head title="Presensi Sholat Berjamaah" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Presensi Sholat Berjamaah</h1>
                    <p className="text-muted-foreground">
                        Scan QR Code atau cari nama siswa untuk presensi
                        {prayer_label && (
                            <Badge variant="default" className="ml-2">
                                <Clock className="mr-1 h-3 w-3" />
                                {prayer_label}
                            </Badge>
                        )}
                    </p>
                    {!current_prayer && (
                        <p className="mt-1 text-sm text-amber-600">
                            Saat ini bukan waktu sholat berjamaah. Jadwal:{' '}
                            {Object.values(prayer_times).map((pt) => `${pt.label} (${pt.start_time}-${pt.end_time})`).join(', ')}.
                        </p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Scanner QR Code</CardTitle>
                                <CardDescription>Arahkan kamera ke QR Code siswa</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div id="qr-reader" ref={scannerContainerRef} className="w-full" />

                                <div className="flex gap-2">
                                    {!isScanning ? (
                                        <Button onClick={startScanner} className="flex-1">
                                            <Scan className="mr-2 h-4 w-4" /> Mulai Scan
                                        </Button>
                                    ) : (
                                        <Button onClick={stopScanner} variant="destructive" className="flex-1">
                                            Berhenti Scan
                                        </Button>
                                    )}
                                </div>

                                {isLookingUp && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat data siswa...
                                    </div>
                                )}

                                {lookupError && (
                                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        <span>{lookupError}</span>
                                        <Button variant="ghost" size="sm" onClick={dismissError}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cari Nama Siswa</CardTitle>
                                <CardDescription>Gunakan jika siswa lupa membawa QR Code</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        placeholder="Ketik nama siswa..."
                                        className="pl-10"
                                    />
                                    {isSearchingStudents && (
                                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        {searchResults.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                    {student.classroom || '-'}
                                                    {student.nis && ` | NIS: ${student.nis}`}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => submitByStudentId(student.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    <UserCheck className="mr-1 h-4 w-4" /> Hadir
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchQuery.trim() && !isSearchingStudents && searchResults.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        Siswa tidak ditemukan
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistik Hari Ini</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <p className="text-4xl font-bold">{today_count}</p>
                                    <p className="text-muted-foreground">Siswa sudah presensi</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Presensi Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {recent_attendances.map((att, i) => (
                                        <div key={i} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{att.student_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {att.prayer_type} - Operator: {att.operator_name}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">{att.attended_at}</Badge>
                                        </div>
                                    ))}
                                    {recent_attendances.length === 0 && (
                                        <p className="text-center text-muted-foreground">Belum ada presensi hari ini</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog
                    open={pendingConfirmation !== null}
                    onOpenChange={(open) => {
                        if (!open) cancelConfirmation();
                    }}
                >
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Presensi</DialogTitle>
                            <DialogDescription>
                                Apakah data siswa berikut sudah sesuai?
                            </DialogDescription>
                        </DialogHeader>
                        {pendingConfirmation && (
                            <div className="space-y-3 py-2">
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold">{pendingConfirmation.student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {pendingConfirmation.student.classroom || 'Kelas: -'}
                                        </p>
                                        {pendingConfirmation.student.nis && (
                                            <p className="text-sm text-muted-foreground">
                                                NIS: {pendingConfirmation.student.nis}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {prayer_label && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Waktu sholat: <strong>{prayer_label}</strong></span>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={cancelConfirmation} disabled={isSubmitting}>
                                Batal
                            </Button>
                            <Button onClick={confirmAttendance} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Hadir
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AttendancePrayer.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Presensi Sholat Berjamaah', href: attendance.prayer() },
    ],
};
