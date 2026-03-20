import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

type Variant = 'default' | 'destructive' | 'success' | 'warning';

interface NotificationDialogProps {
    isOpen: boolean;
    header: string;
    message: string;
    variant?: Variant;
    onClose: () => void;
}

const icons = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle2,
    warning: TriangleAlert,
};

const colors = {
    default: 'text-blue-500',
    destructive: 'text-destructive',
    success: 'text-green-600 dark:text-green-500',
    warning: 'text-orange-600 dark:text-orange-500',
};

export function NotificationDialog({
    isOpen,
    header,
    message,
    variant = 'default',
    onClose,
}: NotificationDialogProps) {
    const Icon = icons[variant];
    const colorClass = colors[variant];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* onOpenChange is empty to prevent closing by clicking outside/ESC */}

            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle
                        className={`flex items-center gap-2 ${colorClass}`}
                    >
                        <Icon className="h-5 w-5" />
                        {header}
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-left text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex justify-end">
                    {/* This button simply toggles the state passed from parent via a hack or we rely on controlled state? 
              Wait, if I don't pass a setter, I can't close it. 
              See explanation below code. */}
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
