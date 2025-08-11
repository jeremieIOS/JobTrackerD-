import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'

interface ResponsiveNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateJob: () => void
  onCreateTeam: () => void
  showNotifications: boolean
  onToggleNotifications: () => void
}

export function ResponsiveNav(props: ResponsiveNavProps) {
  return (
    <>
      {/* Desktop Navigation (hidden on mobile) */}
      <DesktopNav {...props} />
      
      {/* Mobile Navigation (hidden on desktop) */}
      <MobileNav {...props} />
    </>
  )
}
