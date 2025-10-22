import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/app/store"
import { Container } from "@/components/layout/Container"
import {
    CheckCircle,
    Lightbulb,
    FileText,
    UploadCloud,
    Sparkles,
    Wand2,
} from "lucide-react"
import resumeIllustration from "@/assets/ai-resume-illustration.png"
import { FadeInSection } from "@/components/ui/FadeInSection"

export default function LandingScreen() {
    // 🔄 Grab auth state from Redux store
    const { user } = useSelector((state: RootState) => state.auth)

    // ✅ Auth check to conditionally render UI
    const isAuthenticated = Boolean(user)

    return (
        <div className="bg-background text-foreground transition-colors duration-300">
            {/* ✅ Authenticated Banner */}
            {isAuthenticated && (
                <div className="w-full bg-green-100 text-green-800 py-2 text-center text-sm font-medium dark:bg-green-900 dark:text-green-200">
                    ✅ Welcome back {user?.name || "User"} — access your dashboard anytime.
                </div>
            )}

            {/* 🎯 Hero Section */}
            <FadeInSection>
                <section className="py-24">
                    <Container className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left max-w-xl">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
                                AI Resume Analyzer for Job Matching & ATS Optimization
                            </h1>
                            <p className="text-lg text-muted-foreground mb-6">
                                {isAuthenticated
                                    ? "Welcome back! Ready to run another resume analysis?"
                                    : "Upload your resume and job description to get AI-powered feedback, keyword suggestions, and ATS-friendly rewriting — all in seconds."}
                            </p>
                            <Link
                                to={isAuthenticated ? "/analyze" : "/register"}
                                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
                            >
                                {isAuthenticated ? "Run New Analysis" : "Try It Free"}
                            </Link>
                            {!isAuthenticated && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    No signup needed to get your match score.
                                </p>
                            )}
                        </div>

                        {/* 🖼️ Hero Illustration */}
                        <div className="max-w-md w-full">
                            <img
                                src={resumeIllustration}
                                alt="AI analyzing resume"
                                className="w-full h-auto"
                            />
                        </div>
                    </Container>
                </section>
            </FadeInSection>

            {/* ✨ Feature Highlights */}
            <FadeInSection delay={0.2}>
                <section className="py-20 bg-muted text-muted-foreground">
                    <Container className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<CheckCircle className="w-8 h-8 text-primary" />}
                            title="Match Score"
                            description="See how well your resume matches a job description instantly"
                        />
                        <FeatureCard
                            icon={<Lightbulb className="w-8 h-8 text-primary" />}
                            title="AI Feedback"
                            description="Unlock smart suggestions to boost your resume performance"
                        />
                        <FeatureCard
                            icon={<FileText className="w-8 h-8 text-primary" />}
                            title="Resume Rewriting"
                            description="Generate a keyword-optimized resume with one click"
                        />
                    </Container>
                </section>
            </FadeInSection>

            {/* 🔁 Step-by-Step Process */}
            <FadeInSection delay={0.4}>
                <section className="py-20">
                    <Container>
                        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <StepCard
                                icon={<UploadCloud className="w-10 h-10 mx-auto text-primary" />}
                                title="Upload"
                                description="Add your resume and target job description"
                            />
                            <StepCard
                                icon={<Sparkles className="w-10 h-10 mx-auto text-primary" />}
                                title="Analyze"
                                description="Let AI compare and score your match"
                            />
                            <StepCard
                                icon={<Wand2 className="w-10 h-10 mx-auto text-primary" />}
                                title="Improve"
                                description="Sign in to unlock feedback and AI-powered rewriting"
                            />
                        </div>
                    </Container>
                </section>
            </FadeInSection>

            {/* 🚀 Final CTA */}
            <FadeInSection delay={0.6}>
                <section className="py-24 bg-primary text-primary-foreground text-center">
                    <Container>
                        <h2 className="text-3xl font-bold mb-3">Ready to stand out?</h2>
                        <p className="text-lg mb-6">
                            Improve your resume with AI. Match job descriptions, boost your ATS score, and increase interview calls — instantly.
                        </p>
                        <Link
                            to="/analyze"
                            className="inline-block bg-background text-primary dark:text-white px-6 py-3 rounded-xl shadow hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
                        >
                            Start for Free
                        </Link>
                    </Container>
                </section>
            </FadeInSection>

            {/* 📱 Floating Mobile CTA */}
            {!isAuthenticated && (
                <Link
                    to="/analyze"
                    className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg z-50 hover:scale-105 transition md:hidden"
                >
                    Try Now
                </Link>
            )}
        </div>
    )
}

// ✅ Reusable card for features (icons + content)
const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) => {
    return (
        <div className="p-6 rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

// ✅ Reusable step for “How It Works”
const StepCard = ({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) => {
    return (
        <div className="bg-card p-6 rounded-xl shadow hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            {icon}
            <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}
