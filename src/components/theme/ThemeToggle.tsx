import { Monitor, Moon, Sun } from '../ui/icons'
import { Button } from '../../lib/components'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useTheme } from '../providers/ThemeProvider'
import { defaultOutlineIcon } from '../ui/icons'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className={defaultOutlineIcon} />
      case 'dark':
        return <Moon className={defaultOutlineIcon} />
      default:
        return <Monitor className={defaultOutlineIcon} />
    }
  }

  const getCurrentLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      default:
        return 'System'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {getCurrentIcon()}
          <span className="hidden sm:inline">{getCurrentLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
          <Sun className={defaultOutlineIcon} />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
          <Moon className={defaultOutlineIcon} />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
          <Monitor className={defaultOutlineIcon} />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
