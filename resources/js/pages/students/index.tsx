import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, QrCode, Upload, Download, Printer, Loader2, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import students from '@/routes/students';
import type { BreadcrumbItem } from '@/types';
import { useRef, useState } from 'react';

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    nis: string | null;
    nisn: string | null;
    name: string;
    classroom: string | null;
    qr_code: string | null;
    status: 'active' | 'inactive';
    created_at: string;
}

interface PaginatedData {
    data: Student[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

export default function StudentsIndex({
    students: studentsData,
    classrooms,
    filters,
}: {
    students: PaginatedData;
    classrooms: Classroom[];
    filters: { search?: string; classroom_id?: string };
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [qrModal, setQrModal] = useState<{
        open: boolean;
        loading: boolean;
        student: { id: number; name: string; nis: string | null; classroom: string | null } | null;
        qrImage: string | null;
        qrCode: string | null;
    }>({
        open: false,
        loading: false,
        student: null,
        qrImage: null,
        qrCode: null,
    });

    const handleOpenQr = async (studentId: number) => {
        setQrModal({ open: true, loading: true, student: null, qrImage: null, qrCode: null });

        try {
            const res = await fetch(students.qr.data.url(studentId));
            const data = await res.json();

            setQrModal({
                open: true,
                loading: false,
                student: data.student,
                qrImage: data.qr_image,
                qrCode: data.qr_code,
            });
        } catch {
            setQrModal((prev) => ({ ...prev, open: false, loading: false }));
        }
    };

    const handleCloseQr = () => {
        setQrModal({ open: false, loading: false, student: null, qrImage: null, qrCode: null });
    };

    const handlePrintQr = () => {
        if (!qrModal.student || !qrModal.qrImage) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const s = qrModal.student;
        printWindow.document.write(`
            <html>
                <head><title>QR Code - ${s.name}</title>
                <style>
                    body { display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; font-family:sans-serif; }
                    .card { text-align:center; padding:20px; }
                    h2 { margin-bottom:4px; }
                    p { color:#666; margin:4px 0; }
                    img { width:256px; height:256px; margin:16px 0; image-rendering:pixelated; }
                    .code { font-size:11px; color:#999; word-break:break-all; }
                </style>
                </head>
                <body>
                    <div class="card">
                        <h2>${s.name}</h2>
                        <p>NIS: ${s.nis || '-'}</p>
                        <p>Kelas: ${s.classroom || '-'}</p>
                        <img src="${qrModal.qrImage}" alt="QR Code" />
                        <p class="code">Kode: ${qrModal.qrCode}</p>
                    </div>
                    <script>window.onload=function(){window.print();}<\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadQr = () => {
        if (!qrModal.qrImage || !qrModal.student) return;
        const link = document.createElement('a');
        link.href = qrModal.qrImage;
        link.download = `QR-${qrModal.student.name}.png`;
        link.click();
    };

    const { setData: setImportData, post: postImport, processing: importProcessing } = useForm({
        file: null as File | null,
    });

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            router.delete(students.destroy.url(id));
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportData('file', file);
            postImport(students.import(), {
                forceFormData: true,
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Siswa', href: students.index() },
    ];

    return (
        <>
            <Head title="Manajemen Siswa" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
                        <p className="text-muted-foreground">Kelola data siswa</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importProcessing}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
                        <Button asChild>
                            <Link href={students.create()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Siswa
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Siswa</CardTitle>
                        <CardDescription>Total {studentsData.total} siswa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari siswa..."
                                    className="pl-10"
                                    defaultValue={filters.search}
                                    onChange={(e) => router.get(students.index(), { search: e.target.value, classroom_id: filters.classroom_id }, { preserveState: true })}
                                />
                            </div>
                            <Select
                                value={filters.classroom_id || 'all'}
                                onValueChange={(value) => router.get(students.index(), { search: filters.search, classroom_id: value === 'all' ? '' : value }, { preserveState: true })}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kelas</SelectItem>
                                    {classrooms.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">NIS</th>
                                        <th className="px-4 py-2 text-left font-medium">Nama</th>
                                        <th className="px-4 py-2 text-left font-medium">Kelas</th>
                                        <th className="px-4 py-2 text-left font-medium">Status</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsData.data.map((student) => (
                                        <tr key={student.id} className="border-b">
                                            <td className="px-4 py-2">{student.nis || '-'}</td>
                                            <td className="px-4 py-2 font-medium">{student.name}</td>
                                            <td className="px-4 py-2">{student.classroom || '-'}</td>
                                            <td className="px-4 py-2">
                                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                    {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenQr(student.id)}>
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={students.edit.url(student.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
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
                                Menampilkan {studentsData.data.length} dari {studentsData.total} data
                            </p>
                            <div className="flex gap-2">
                                {studentsData.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(studentsData.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {studentsData.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(studentsData.next_page_url)}>
                                        Selanjutnya
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={qrModal.open} onOpenChange={(open) => { if (!open) handleCloseQr(); }}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>QR Code Siswa</DialogTitle>
                        </DialogHeader>
                        {qrModal.loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : qrModal.student && qrModal.qrImage ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="text-lg font-bold">{qrModal.student.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        NIS: {qrModal.student.nis || '-'}
                                        {qrModal.student.classroom && ` | Kelas: ${qrModal.student.classroom}`}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <img src={qrModal.qrImage} alt="QR Code" className="h-48 w-48" />
                                </div>
                                <p className="text-xs text-muted-foreground break-all text-center">
                                    Kode: {qrModal.qrCode}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handlePrintQr}>
                                        <Printer className="mr-2 h-4 w-4" /> Cetak
                                    </Button>
                                    <Button variant="outline" onClick={handleDownloadQr}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Siswa', href: students.index() },
    ],
};
