import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import roles from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: string[];
    users_count: number;
    created_at: string;
}

export default function RolesIndex({ roles: rolesData }: { roles: Role[] }) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            router.delete(roles.destroy.url(id));
        }
    };

    return (
        <>
            <Head title="Manajemen Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Roles &amp; Permissions</h1>
                        <p className="text-muted-foreground">Kelola role dan hak akses pengguna</p>
                    </div>
                    <Button asChild>
                        <Link href={roles.create()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Role
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Role</CardTitle>
                        <CardDescription>Total {rolesData.length} role terdaftar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">Role</th>
                                        <th className="px-4 py-2 text-left font-medium">Permissions</th>
                                        <th className="px-4 py-2 text-left font-medium">Pengguna</th>
                                        <th className="px-4 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rolesData.map((role) => (
                                        <tr key={role.id} className="border-b">
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map((perm) => (
                                                        <Badge key={perm} variant="outline" className="text-xs">
                                                            {perm}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">{role.users_count} user</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={roles.edit.url(role.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {role.name !== 'superadmin' && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles & Permissions', href: roles.index() },
    ],
};
