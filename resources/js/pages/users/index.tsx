import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    school_name: string | null;
    roles: string[];
    created_at: string;
}

interface PaginatedData {
    data: User[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface School {
    id: number;
    name: string;
}

export default function UsersIndex({
    users: usersData,
    schools,
    roles,
    filters,
}: {
    users: PaginatedData;
    schools: School[];
    roles: string[];
    filters: { search?: string; role?: string; school_id?: string };
}) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            router.delete(users.destroy.url(id));
        }
    };

    return (
        <>
            <Head title="Manajemen Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
                        <p className="text-muted-foreground">Kelola akun pengguna</p>
                    </div>
                    <Button asChild>
                        <Link href={users.create()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Pengguna
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengguna</CardTitle>
                        <CardDescription>Total {usersData.total} pengguna</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari pengguna..."
                                    className="pl-10"
                                    defaultValue={filters.search}
                                    onChange={(e) => router.get(users.index(), { ...filters, search: e.target.value }, { preserveState: true })}
                                />
                            </div>
                            <Select
                                value={filters.role || 'all'}
                                onValueChange={(value) => router.get(users.index(), { ...filters, role: value === 'all' ? '' : value }, { preserveState: true })}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Role</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {schools.length > 0 && (
                                <Select
                                    value={filters.school_id || 'all'}
                                    onValueChange={(value) => router.get(users.index(), { ...filters, school_id: value === 'all' ? '' : value }, { preserveState: true })}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Semua Sekolah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Sekolah</SelectItem>
                                        {schools.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">Nama</th>
                                        <th className="px-4 py-2 text-left font-medium">Email</th>
                                        <th className="px-4 py-2 text-left font-medium">Sekolah</th>
                                        <th className="px-4 py-2 text-left font-medium">Role</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersData.data.map((user) => (
                                        <tr key={user.id} className="border-b">
                                            <td className="px-4 py-2 font-medium">{user.name}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{user.school_name || '-'}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge key={role} variant="secondary">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={users.edit.url(user.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
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
                                Menampilkan {usersData.data.length} dari {usersData.total} data
                            </p>
                            <div className="flex gap-2">
                                {usersData.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(usersData.prev_page_url)}>
                                        Sebelumnya
                                    </Button>
                                )}
                                {usersData.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(usersData.next_page_url)}>
                                        Selanjutnya
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pengguna', href: users.index() },
    ],
};
