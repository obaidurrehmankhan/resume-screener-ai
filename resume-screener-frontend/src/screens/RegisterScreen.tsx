import { useState } from 'react'
import { useRegisterMutation } from '@/features/auth/authApi'
import { useAuthStore } from '@/features/auth/authStore'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const RegisterScreen = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        profession: '',
    })

    const [errorMsg, setErrorMsg] = useState('')
    const [triggerRegister, { isLoading }] = useRegisterMutation()
    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('')

        try {
            const res = await triggerRegister(form).unwrap()
            login(res.token)           // ✅ Save token to Zustand
            navigate('/dashboard')     // ✅ Redirect
        } catch (err) {
            setErrorMsg('Registration failed')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-6 space-y-4 bg-muted/30 shadow-md rounded-md border"
            >
                <h2 className="text-2xl font-bold text-center">Create an Account</h2>

                <Input
                    name="name"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="profession"
                    placeholder="Your Profession"
                    value={form.profession}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                {errorMsg && (
                    <div className="text-sm text-red-500 text-center">{errorMsg}</div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Register'}
                </Button>
            </form>
        </div>
    )
}

export default RegisterScreen
