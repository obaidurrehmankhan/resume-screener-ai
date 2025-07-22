import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/features/auth/authApi'
import { useAuthStore } from '@/features/auth/authStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const navigate = useNavigate()

    const { login } = useAuthStore()
    const [triggerLogin, { isLoading }] = useLoginMutation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('')

        try {
            const res = await triggerLogin({ email, password }).unwrap()
            login(res.token)             // 🧠 Store token in Zustand
            navigate('/dashboard')       // ➡️ Redirect after login
        } catch (err) {
            setErrorMsg('Invalid credentials')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-6 space-y-4 bg-muted/30 shadow-md rounded-md border"
            >
                <h2 className="text-2xl font-bold text-center">Login to ScanHire AI</h2>

                <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {errorMsg && (
                    <div className="text-sm text-red-500 text-center">{errorMsg}</div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
        </div>
    )
}

export default LoginScreen
