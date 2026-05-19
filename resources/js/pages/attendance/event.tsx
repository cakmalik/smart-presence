import { Head, router } from '@inertiajs/react';
import { Scan, CheckCircle, XCircle } from 'lucide-react';
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
import attendance from '@/routes/attendance';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Event {
    id: number;
    name: string;
    start_date: string;
    location: string | null;
}

export default function AttendanceEvent({ events }: { events: Event[] }) {
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [manualCode, setManualCode] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    const startScanner = async () => {
        if (!scannerContainerRef.current || !selectedEvent) return;

        scannerRef.current = new Html5Qrcode('qr-reader-event');

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
        if (isSubmitting || !selectedEvent) return;
        setIsSubmitting(true);
        setScanResult(null);

        router.post(
            attendance.event.store.url(),
            { qr_code: qrCode, event_id: selectedEvent },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setScanResult({ success: true, message: 'Presensi berhasil dicatat' });
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setScanResult({ success: false, message: (errors as any).qr_code || 'Presensi gagal' });
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
        { title: 'Presensi Event', href: attendance.event() },
    ];

    return (
        <>
            <Head title="Presensi Event" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Presensi Event</h1>
                    <p className="text-muted-foreground">Scan QR Code siswa untuk presensi event</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scanner QR Code</CardTitle>
                            <CardDescription>Pilih event lalu scan QR Code siswa</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="event">Pilih Event</Label>
                                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map((event) => (
                                            <SelectItem key={event.id} value={String(event.id)}>
                                                {event.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div id="qr-reader-event" ref={scannerContainerRef} className="w-full" />

                            <div className="flex gap-2">
                                {!isScanning ? (
                                    <Button onClick={startScanner} className="flex-1" disabled={!selectedEvent}>
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
                                    <Button type="submit" disabled={isSubmitting || !selectedEvent || !manualCode}>
                                        Submit
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {scanResult && (
                            <Card className={scanResult.success ? 'border-green-500' : 'border-red-500'}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        {scanResult.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                            {scanResult.message}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Event Aktif</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {events.map((event) => (
                                        <div key={event.id} className="rounded-lg border p-3">
                                            <p className="font-medium">{event.name}</p>
                                            <p className="text-sm text-muted-foreground">{event.start_date}</p>
                                            {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
                                        </div>
                                    ))}
                                    {events.length === 0 && (
                                        <p className="text-center text-muted-foreground">Tidak ada event aktif</p>
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

AttendanceEvent.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Presensi Event', href: attendance.event() },
    ],
};
