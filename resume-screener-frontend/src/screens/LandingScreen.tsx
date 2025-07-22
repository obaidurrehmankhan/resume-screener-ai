import { Link } from "react-router-dom"
import { Container } from "@/components/layout/Container"
import {
    CheckCircle,
    Lightbulb,
    FileText,
} from "lucide-react"
import resumeIllustration from "@/assets/ai-resume-illustration.png"

export default function LandingScreen() {
    return (
        <div className="bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <section className="py-24">
                <Container className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
                    <div className="text-center lg:text-left max-w-xl">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 transition-all duration-300">
                            AI-Powered Resume Screener
                        </h1>
                        <p className="text-lg text-muted-foreground mb-6 transition-all duration-300">
                            Instantly analyze your resume and get job-specific feedback to boost your chances.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Illustration */}
                    <div className="max-w-md w-full">
                        <img
                            src={resumeIllustration}
                            alt="AI analyzing resume"
                            className="w-full h-auto transition-all duration-300"
                        />
                    </div>
                </Container>
            </section>

            {/* Feature Cards */}
            <section className="py-20 bg-muted text-muted-foreground">
                <Container className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<CheckCircle className="w-8 h-8 text-primary" />}
                        title="Match Score"
                        description="View how well your resume matches a job description"
                    />
                    <FeatureCard
                        icon={<Lightbulb className="w-8 h-8 text-primary" />}
                        title="AI Feedback"
                        description="Get actionable tips to improve your resume instantly"
                    />
                    <FeatureCard
                        icon={<FileText className="w-8 h-8 text-primary" />}
                        title="Resume Rewriting"
                        description="Generate an updated, keyword-rich resume with AI"
                    />
                </Container>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-primary text-primary-foreground text-center">
                <Container>
                    <h2 className="text-3xl font-bold mb-3">Ready to stand out?</h2>
                    <p className="text-lg mb-6">
                        Let AI optimize your resume and land more interviews—no guesswork.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-background text-primary dark:text-white px-6 py-3 rounded-xl shadow hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
                    >
                        Start for Free
                    </Link>
                </Container>
            </section>
        </div>
    )
}

// 🔄 Updated FeatureCard with hover polish
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
        <div className="p-6 rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}
