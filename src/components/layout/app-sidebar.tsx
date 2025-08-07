'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import {
  LayoutDashboard,
  Combine,
  Split,
  Minimize2,
  Lock,
  FileImage,
  Image as ImageIcon,
  FileSignature,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

const pdfTools = [
  { name: 'Merge PDF', href: '/pdf-tools/merge', icon: Combine },
  { name: 'Split PDF', href: '/pdf-tools/split', icon: Split },
  { name: 'Compress PDF', href: '/pdf-tools/compress', icon: Minimize2 },
  { name: 'Secure PDF', href: '/pdf-tools/secure', icon: Lock },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const isPdfToolActive = pdfTools.some(tool => pathname.startsWith(tool.href));

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold">CrackToolKit</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/')}>
              <Link href="/">
                <LayoutDashboard />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible defaultOpen={isPdfToolActive}>
            <SidebarGroup className='p-0'>
              <CollapsibleTrigger className='w-full'>
                 <SidebarGroupLabel asChild>
                    <div className='flex items-center justify-between w-full cursor-pointer hover:bg-sidebar-accent rounded-md'>
                      PDF Toolkit
                      <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </div>
                  </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                  <SidebarMenuSub>
                    {pdfTools.map((tool) => (
                      <SidebarMenuSubItem key={tool.name}>
                        <SidebarMenuSubButton asChild isActive={isActive(tool.href)}>
                          <Link href={tool.href}>
                            <tool.icon />
                            {tool.name}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>


          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/pdf-to-image')}>
              <Link href="/pdf-to-image">
                <FileImage />
                PDF to Image
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/image-to-pdf')}>
              <Link href="/image-to-pdf">
                <ImageIcon />
                Image to PDF
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/fillable-form')}>
              <Link href="/fillable-form">
                <FileSignature />
                AI Fillable Form
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
