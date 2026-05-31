import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';
import { School, Users, GraduationCap, CalendarDays, ScanLine, FileText, QrCode } from 'lucide-react';

const features = [
    // { icon: School, title: 'Kelola Sekolah', description: 'Atur data sekolah dengan mudah dan terpusat' },
    { icon: Users, title: 'Manajemen Kelas', description: 'Kelola kelas dan pembagian siswa secara efisien' },
    { icon: GraduationCap, title: 'Data Siswa', description: 'Database siswa lengkap dengan kartu QR' },
    { icon: ScanLine, title: 'Presensi Sholat', description: 'Scan kehadiran sholat berjamaah secara real-time' },
    { icon: CalendarDays, title: 'Presensi Event', description: 'Presensi otomatis untuk kegiatan & acara' },
    { icon: FileText, title: 'Laporan', description: 'Rekap dan ekspor laporan presensi' },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Smart Presence - Sistem Presensi Pondok" />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="flex w-full items-center justify-between px-6 py-4 lg:px-10">
                    {/*
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <AppLogoIcon className="size-7 fill-current" />
                        <span className="text-lg">Smart Presence</span>
                    </Link>
                    */}
                    {/*
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </nav>
                                    */}
                </header>

                <main className="flex flex-1 flex-col">
                    <section className="flex flex-col items-center px-6 pt-20 pb-16 text-center lg:pt-28 lg:pb-20">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                            <QrCode className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight lg:text-5xl">
                            Smart Presence
                        </h1>
                        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                            Sistem presensi digital berbasis QR Code.
                            Pantau kehadiran sholat berjamaah dan event secara real-time.
                        </p>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                    >
                                        Mulai Sekarang
                                    </Link>
                                    {/*
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-lg border bg-background px-6 py-3 text-sm font-medium hover:bg-accent"
                                    >
                                        Buat Akun
                                    </Link>
                                        */}
                                </>
                            )}
                        </div>
                    </section>

                    <section className="border-t bg-muted/50 px-6 py-16 lg:py-20">
                        <div className="mx-auto max-w-5xl">
                            <h2 className="mb-2 text-center text-2xl font-bold">Fitur Unggulan</h2>
                            <p className="mb-10 text-center text-muted-foreground">
                                Semua yang Anda butuhkan untuk mengelola presensi pondok
                            </p>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="rounded-xl border bg-card p-6 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <feature.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="mb-1 font-semibold">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Smart Presence. All rights reserved.
                    </footer>
                </main>
            </div>
        </>
    );
}
