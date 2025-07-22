import { useState } from 'react'
import { useRegisterMutation } from '@/features/auth/authApi'
import { useAuthStore } from '@/features/auth/authStore'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type FieldErrors = {
    name?: string
    profession?: string
    email?: string
    password?: string
}

const RegisterScreen = () => {
    const [form, setForm] = useState({
        name: '',
        profession: '',
        email: '',
        password: '',
    })

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

    const [triggerRegister, { isLoading }] = useRegisterMutation()
    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Manual client-side validation
        const errors: Record<string, string> = {}
        if (!form.name.trim()) errors.name = 'Name is required'
        if (!form.profession.trim()) errors.profession = 'Profession is required'
        if (!form.email.includes('@')) errors.email = 'Enter a valid email address'
        if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            const res = await triggerRegister(form).unwrap()
            login(res.token)
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
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-primary mb-1">
                        Create Your Account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        It only takes a few seconds to get started
                    </p>
                </div>

                {/* Name */}
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

                {/* Profession */}
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
                    {fieldErrors.profession && <p className="text-xs text-red-500 mt-1">{fieldErrors.profession}</p>}
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
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="bg-muted/20 border border-border dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                    {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full hover:scale-[1.02] transition-transform duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating...' : 'Register'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        to="/register"
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
