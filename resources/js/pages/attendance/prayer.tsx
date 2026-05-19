import { Head, router } from '@inertiajs/react';
import { Scan, CheckCircle, XCircle, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: { student_name: string; prayer_type: string; attended_at: string } } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    const startScanner = async () => {
        if (!scannerContainerRef.current) return;

        scannerRef.current = new Html5Qrcode('qr-reader');

        try {
            await scannerRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await submitAttendance(decodedText);
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

    const submitAttendance = (qrCode: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setScanResult(null);

        router.post(
            attendance.prayer.store.url(),
            { qr_code: qrCode },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setScanResult({ success: true, message: 'Presensi berhasil dicatat' });
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setScanResult({ success: false, message: (errors as any).qr_code || (errors as any).message || 'Presensi gagal' });
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitAttendance(manualCode);
        setManualCode('');
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
                        Scan QR Code siswa untuk presensi
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

                            <div className="border-t pt-4">
                                <Label>Input Manual</Label>
                                <form onSubmit={handleManualSubmit} className="mt-2 flex gap-2">
                                    <Input
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        placeholder="Masukkan kode QR"
                                    />
                                    <Button type="submit" disabled={isSubmitting || !manualCode}>
                                        Submit
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

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

                        {scanResult && (
                            <Card className={scanResult.success ? 'border-green-500' : 'border-red-500'}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        {scanResult.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <div>
                                            <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                                {scanResult.message}
                                            </p>
                                            {scanResult.data && (
                                                <p className="text-sm">
                                                    {scanResult.data.student_name}
                                                    {scanResult.data.prayer_type && ` - ${scanResult.data.prayer_type}`}
                                                    {' - '}
                                                    {scanResult.data.attended_at}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
