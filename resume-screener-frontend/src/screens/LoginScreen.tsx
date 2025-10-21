import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation, useLazyGetMeQuery } from '@/features/auth/authApi'
import { useDispatch } from 'react-redux'
import { setToken, setUser } from '@/features/auth/authSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const LoginScreen = () => {
    // 🎯 Form state for controlled inputs
    const [form, setForm] = useState({
        email: '',
        password: '',
    })

    // ⚠️ Field-level validation error state
    const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({})

    // 👁 Toggle password visibility
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    // 🔗 RTK Query login mutation
    const [triggerLogin, { isLoading }] = useLoginMutation()
    const [triggerGetMe] = useLazyGetMeQuery()

    // 📌 Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setFieldErrors((prev) => ({ ...prev, [name]: '' })) // clear error on change
    }

    // ✅ Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 🔍 Basic client-side validation
        const errors: Partial<typeof form> = {}
        if (!form.email.includes('@')) {
            errors.email = 'Enter a valid email'
        }
        if (form.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        // ⚠️ Show validation errors if any
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            // 🔐 Step 1: Call login API → returns JWT token
            const { token } = await triggerLogin(form).unwrap()

            // ✅ Step 2: Save token to Redux store (and localStorage internally)
            dispatch(setToken(token))

            // 🔄 Step 3: Immediately fetch user info using token
            const currentUser = await triggerGetMe().unwrap()

            // 🧠 Step 4: Save user info to Redux store
            dispatch(setUser(currentUser))

            // 🚦 Step 5: Redirect based on role
            if (currentUser.role === 'admin') {
                navigate('/admin') // 🧭 Admin panel
            } else {
                navigate('/dashboard') // 🧭 Regular user dashboard
            }
        } catch (err: any) {
            // ❌ Show toast error for failed login
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
                {/* 🔒 Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-primary mb-1">
                        Login to ScanHire AI
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to continue
                    </p>
                </div>

                {/* 📧 Email Field */}
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
                    {fieldErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                    )}
                </div>

                {/* 🔐 Password Field */}
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
                    {fieldErrors.password && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                    )}
                </div>

                {/* 🚀 Submit Button */}
                <Button
                    type="submit"
                    className="w-full hover:scale-[1.02] transition-transform duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                {/* 🔗 Register Redirect */}
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
