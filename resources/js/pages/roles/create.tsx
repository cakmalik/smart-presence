import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import roles from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles & Permissions', href: roles.index() },
    { title: 'Tambah', href: roles.create() },
];

export default function RolesCreate({ permissions }: { permissions: string[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(roles.store());
    };

    const togglePermission = (perm: string) => {
        setData(
            'permissions',
            data.permissions.includes(perm)
                ? data.permissions.filter((p) => p !== perm)
                : [...data.permissions, perm]
        );
    };

    return (
        <>
            <Head title="Tambah Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={roles.index()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Role</h1>
                        <p className="text-muted-foreground">Buat role baru dengan hak akses tertentu</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Role</CardTitle>
                        <CardDescription>Isi nama role dan pilih permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Nama Role</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: guru"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div>
                                <Label>Permissions</Label>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Pilih hak akses yang dimiliki role ini
                                </p>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {permissions.map((perm) => (
                                        <label
                                            key={perm}
                                            className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted"
                                        >
                                            <Checkbox
                                                checked={data.permissions.includes(perm)}
                                                onCheckedChange={() => togglePermission(perm)}
                                            />
                                            <span className="text-sm capitalize">
                                                {perm.replace(/_/g, ' ')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.permissions && (
                                    <p className="mt-1 text-sm text-red-500">{errors.permissions}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={roles.index()}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RolesCreate.layout = { breadcrumbs };
