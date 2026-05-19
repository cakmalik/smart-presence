import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { students } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Student {
    id: number;
    nis: string | null;
    name: string;
    classroom: string | null;
}

export default function StudentQr({ student, qr_code, qr_image }: { student: Student; qr_code: string; qr_image: string }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Siswa', href: students.index() },
        { title: student.name, href: students.qr.url(student.id) },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`QR Code - ${student.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={students.index()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">QR Code Siswa</h1>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-center">Kartu Siswa</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="text-center">
                                <p className="text-lg font-bold">{student.name}</p>
                                {student.nis && <p className="text-muted-foreground">NIS: {student.nis}</p>}
                                {student.classroom && <p className="text-muted-foreground">Kelas: {student.classroom}</p>}
                            </div>

                            <div className="rounded-lg border p-4">
                                <img src={qr_image} alt={`QR Code ${student.name}`} className="h-48 w-48" />
                            </div>

                            <p className="text-xs text-muted-foreground">Kode: {qr_code}</p>

                            <div className="flex gap-2 print:hidden">
                                <Button onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Cetak
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
