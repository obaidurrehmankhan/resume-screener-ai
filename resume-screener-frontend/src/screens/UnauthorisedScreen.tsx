// ❌ UnauthorizedScreen: Shown when user role is not allowed to access the route

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const UnauthorizedScreen = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground text-sm mb-6">
                You do not have permission to view this page.
            </p>

            <Button asChild variant="default">
                <Link to="/">Return to Home</Link>
            </Button>
        </div>
    )
}

export default UnauthorizedScreen
