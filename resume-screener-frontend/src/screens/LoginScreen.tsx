import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/features/auth/authApi'
import { useAuthStore } from '@/features/auth/authStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const LoginScreen = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    })

    const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({})
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [triggerLogin, { isLoading }] = useLoginMutation()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const errors: Partial<typeof form> = {}
        if (!form.email.includes('@')) {
            errors.email = 'Enter a valid email'
        }
        if (form.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            const res = await triggerLogin(form).unwrap()
            login(res.token)
            navigate('/dashboard')
        } catch (err) {
            toast.error('Invalid credentials')
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 transition-colors duration-300">
            <form
                noValidate
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-6 p-8 border border-border rounded-xl shadow-lg bg-muted/50 dark:bg-white/5 backdrop-blur-md transition-all duration-300"
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-primary mb-1">
                        Login to ScanHire AI
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to continue
                    </p>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-foreground">
                        Email
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="bg-muted/20 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block mb-1 text-sm font-medium text-foreground">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            className="pr-10 bg-muted/20 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2.5 right-3 text-muted-foreground hover:text-primary transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full hover:scale-[1.02] transition-transform duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                    Don’t have an account?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-primary hover:underline transition-colors"
                    >
                        Create one
                    </Link>
                </p>

            </form>

        </div>
    )
}

export default LoginScreen
