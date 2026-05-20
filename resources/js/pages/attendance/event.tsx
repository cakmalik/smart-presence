import { Head, router } from '@inertiajs/react';
import { Scan, CheckCircle, XCircle, Clock, Search, Loader2, UserCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import attendance from '@/routes/attendance';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface EventItem {
    id: number;
    name: string;
    start_date: string;
    location: string | null;
}

interface RecentAttendance {
    student_name: string;
    event_name: string;
    operator_name: string;
    attended_at: string;
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

export default function AttendanceEvent({
    events,
    selected_event_id,
    selected_event,
    recent_attendances = [],
    today_count = 0,
}: {
    events: EventItem[];
    selected_event_id: number | null;
    selected_event: EventItem | null;
    recent_attendances: RecentAttendance[];
    today_count: number;
}) {
    const [selectedEvent, setSelectedEvent] = useState(selected_event_id ? String(selected_event_id) : '');
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);
    const isProcessingQr = useRef(false);
    const lastQrRef = useRef('');

    const [pendingConfirmation, setPendingConfirmation] = useState<{
        qrCode: string;
        student: { name: string; nis: string | null; classroom: string | null };
    } | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
    const [isSearchingStudents, setIsSearchingStudents] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const handleEventChange = (value: string) => {
        setSelectedEvent(value);
        router.get(attendance.event.url(), { event_id: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const startScanner = async () => {
        if (!scannerContainerRef.current || !selectedEvent) return;

        scannerRef.current = new Html5Qrcode('qr-reader-event');

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
        if (selectedEvent) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [selected_event_id]);

    const onQrDetected = async (decodedText: string) => {
        if (isProcessingQr.current) return;

        const qrValue = decodedText.includes('/')
            ? decodedText.substring(decodedText.lastIndexOf('/') + 1)
            : decodedText;

        if (qrValue === lastQrRef.current) return;
        lastQrRef.current = qrValue;

        isProcessingQr.current = true;
        setIsLookingUp(true);
        setLookupError(null);

        try {
            const res = await fetch(attendance.scan.url(qrValue));
            const data = await res.json();

            if (!data.found || !data.student) {
                setLookupError('Siswa tidak ditemukan atau tidak aktif.');

                return;
            }

            setPendingConfirmation({
                qrCode: qrValue,
                student: data.student,
            });
        } catch {
            setLookupError('Gagal memuat data siswa.');
        } finally {
            setIsLookingUp(false);
        }
    };

    const resetScanner = () => {
        isProcessingQr.current = false;
        lastQrRef.current = '';
        setIsLookingUp(false);
        setPendingConfirmation(null);
        setLookupError(null);
    };

    const confirmAttendance = async () => {
        if (!pendingConfirmation || !selectedEvent) return;
        setIsSubmitting(true);

        try {
            const res = await apiPost(attendance.event.store.url(), {
                qr_code: pendingConfirmation.qrCode,
                event_id: selectedEvent,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message, {
                    description: data.data
                        ? `${data.data.student_name} · ${data.data.event_name} · ${data.data.attended_at}`
                        : undefined,
                });
                resetScanner();
                setTimeout(() => router.reload(), 1500);
            } else {
                toast.error(data.message || 'Presensi gagal');
                resetScanner();
            }
        } catch {
            toast.error('Gagal terhubung ke server.');
            resetScanner();
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelConfirmation = () => {
        resetScanner();
    };

    const dismissError = () => {
        resetScanner();
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
        if (isSubmitting || !selectedEvent) return;
        setIsSubmitting(true);

        try {
            const res = await apiPost(attendance.event.store.url(), {
                student_id: studentId,
                event_id: selectedEvent,
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message, {
                    description: data.data
                        ? `${data.data.student_name} · ${data.data.event_name} · ${data.data.attended_at}`
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

    return (
        <>
            <Head title="Presensi Event" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Presensi Event</h1>
                    <p className="text-muted-foreground">
                        Pilih event lalu scan QR Code atau cari nama siswa untuk presensi
                        {selected_event && (
                            <Badge variant="default" className="ml-2">
                                <Calendar className="mr-1 h-3 w-3" />
                                {selected_event.name}
                            </Badge>
                        )}
                    </p>
                    {events.length === 0 && (
                        <p className="mt-1 text-sm text-amber-600">
                            Tidak ada event aktif saat ini.
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="event">Pilih Event</Label>
                    <Select value={selectedEvent} onValueChange={handleEventChange}>
                        <SelectTrigger className="mt-1 w-full md:w-80">
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

                {selectedEvent && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Scanner QR Code</CardTitle>
                                    <CardDescription>Arahkan kamera ke QR Code siswa</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div id="qr-reader-event" ref={scannerContainerRef} className="w-full" />

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
                                                        {att.event_name} - Operator: {att.operator_name}
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
                )}

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
                                {selected_event && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Event: <strong>{selected_event.name}</strong></span>
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

AttendanceEvent.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Presensi Event', href: attendance.event() },
    ],
};
