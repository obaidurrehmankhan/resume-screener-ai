import { useState } from 'react'
import { useRegisterMutation, authApi } from '@/features/auth/authApi'
import { setToken, setUser } from '@/features/auth/authSlice'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { store } from '@/app/store'

// 🎯 TypeScript types for form structure and validation errors
type FormData = {
    name: string
    profession: string
    email: string
    password: string
}
type FieldErrors = Partial<FormData>

const RegisterScreen = () => {
    // 📝 Controlled form state
    const [form, setForm] = useState<FormData>({
        name: '',
        profession: '',
        email: '',
        password: '',
    })

    // ⚠️ Tracks field-specific validation errors
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

    // 🚀 Redux + navigation setup
    const [register, { isLoading }] = useRegisterMutation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // 🔄 Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setFieldErrors((prev) => ({ ...prev, [name]: '' })) // clear field error
    }

    // ✅ Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 🔍 Client-side validation
        const errors: FieldErrors = {}
        if (!form.name.trim()) errors.name = 'Name is required'
        if (!form.profession.trim()) errors.profession = 'Profession is required'
        if (!form.email.includes('@')) errors.email = 'Enter a valid email'
        if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            // 📤 Send registration API request (POST /auth/register)
            const { token } = await register(form).unwrap()

            // 💾 Save token to Redux + localStorage
            dispatch(setToken(token))

            // 👤 Fetch user info after registration (GET /auth/me)
            const meResult: any = await store.dispatch(authApi.endpoints.getMe.initiate())
            if ('data' in meResult) {
                dispatch(setUser(meResult.data))
            }

            // 🔁 Redirect to dashboard
            navigate('/dashboard')
        } catch (err) {
            toast.error('Registration failed. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 transition-colors duration-300">
            <form
                noValidate
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-6 p-8 border border-border rounded-xl shadow-lg bg-muted/50 dark:bg-white/5 backdrop-blur-md transition-all duration-300"
            >
                {/* 🧾 Form Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-primary mb-1">
                        Create Your Account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        It only takes a few seconds to get started
                    </p>
                </div>

                {/* 👤 Name Field */}
                <div>
                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-foreground">
                        Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={handleChange}
                        className="bg-muted/20 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>

                {/* 💼 Profession Field */}
                <div>
                    <label htmlFor="profession" className="block mb-1 text-sm font-medium text-foreground">
                        Profession
                    </label>
                    <Input
                        id="profession"
                        name="profession"
                        placeholder="Your Profession"
                        value={form.profession}
                        onChange={handleChange}
                        className="bg-muted/20 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                    {fieldErrors.profession && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.profession}</p>
                    )}
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
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="bg-muted/20 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                    {fieldErrors.password && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                    )}
                </div>

                {/* ✅ Submit Button */}
                <Button
                    type="submit"
                    className="w-full hover:scale-[1.02] transition-transform duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating...' : 'Register'}
                </Button>

                {/* 🔗 Redirect to Login */}
                <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary hover:underline transition-colors"
                    >
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default RegisterScreen
