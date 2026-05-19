import React from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

function findPageLayout(children: React.ReactNode): any {
    if (!children) return null;
    if (React.isValidElement(children)) {
        const type = children.type as any;
        if (type && type.layout) {
            return type.layout;
        }
        if (children.props && children.props.children) {
            return findPageLayout(children.props.children);
        }
    }
    return null;
}

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const pageLayout = findPageLayout(children);
    const resolvedBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : (pageLayout?.breadcrumbs || []);

    return (
        <AppLayoutTemplate breadcrumbs={resolvedBreadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
