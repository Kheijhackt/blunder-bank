import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Icons
import {
    BrainCircuit,
    BookOpen,
    Target,
    PenTool,
    Lightbulb,
    Trophy,
    Link as LinkIcon,
    XCircle,
    CheckCircle2,
    ArrowRight,
    Search,
    Database,
    Eye,
} from 'lucide-react';
import { dashboard, guide } from '@/routes';
import ShowGuideContent from '@/components/showGuideContent';

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
