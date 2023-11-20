import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ConnectWallet } from './connect-wallet'
import { Button } from './ui/button'

export async function Header() {

    return (
        <header className="sticky top-0 z-50 flex items-center justify-end w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
            <div className="absolute flex items-center left-0 lg:left-1/2 lg:-translate-x-1/2 gap-2 px-4">
                <Link href="/">
                    <p className='hidden md:flex text-3xl'>Open Secret</p>
                </Link>
            </div>

            <Link href="https://dashboard.opensecret.xyz">
                <Button
                    className="mr-4 hidden md:flex"
                >
                    Token Dashboard
                </Button>
                <Button
                    size='sm'
                    className="mr-4 md:hidden"
                >
                    Dashboard
                </Button>
            </Link>

            <ConnectWallet />
            <ThemeToggle />

        </header>
    )
}