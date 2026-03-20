import { Head } from '@inertiajs/react';
import ShowGuideContent from '@/components/custom/showGuideContent';
import AppLayout from '@/layouts/app-layout';
import { guide } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// Icons

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Guide',
        href: guide(),
    },
];

export default function Guide() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Guide & Philosophy" />
            <ShowGuideContent />
        </AppLayout>
    );
}
