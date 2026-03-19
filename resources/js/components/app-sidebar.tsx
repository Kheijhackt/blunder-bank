import { Link } from '@inertiajs/react';
import {
    BookOpen,
    BrainCircuit,
    FolderGit2,
    Goal,
    Info,
    LayoutGrid,
    LibraryBig,
    Send,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    about,
    blundersList,
    dashboard,
    focusedPracticeFlashCards,
    guide,
    practiceFlashCards,
} from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'My Blunders',
        href: blundersList(),
        icon: LibraryBig,
    },
    {
        title: 'Smart Practice',
        href: practiceFlashCards(),
        icon: BrainCircuit,
    },
    {
        title: 'Focused Practice',
        href: focusedPracticeFlashCards(),
        icon: Goal,
    },
    {
        title: 'User Guide',
        href: guide(),
        icon: Info,
    },
    {
        title: 'About Us',
        href: about(),
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Send Feedback',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLScmNx4z0hF40w7sEIS75k82WOthIH6Ofmh4AuoNrNPOfLd5MA/viewform?usp=publish-editor',
        icon: Send,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
            <footer className="p-1 text-center text-xs text-muted-foreground">
                <p>© {new Date().getFullYear()} Blunder Bank. Made by Calify</p>
            </footer>
        </Sidebar>
    );
}
