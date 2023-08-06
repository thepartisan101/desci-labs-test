// import Navbar from './navbar'
// import Footer from './footer'

import { ThemeProvider } from "./theme-provider"
import { ModeToggle } from './modeToggle'
import Navbar from './navbar'
import { Toaster } from "./ui/toaster"

interface LayoutProps {
    onLogout: () => void;
    children: React.ReactNode;
  }
 
export default function Layout({ onLogout, children }: LayoutProps): JSX.Element {
  return (
    <>
      <Navbar onLogout={onLogout}/>
      {/* <ModeToggle /> */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <main>{children}</main>
        <Toaster />
      </ThemeProvider>
      {/* <Footer /> */}
    </>
  )
}