"use client"

import { BookOpen, Network } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { routes } from "@/lib/routes"

const navItems = [
  { href: routes.ontology.root, label: "Ontology", icon: Network },
  {
    href: routes.knowledgeGraph.root,
    label: "Knowledge Graph",
    icon: BookOpen,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, openMobile, state } = useSidebar()
  const showAppTitle = isMobile ? openMobile : state === "expanded"

  return (
    <Sidebar collapsible="icon">
      {showAppTitle ? (
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <span className="font-heading font-semibold">KG Workbench</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      ) : null}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(href)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="items-end">
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  )
}
