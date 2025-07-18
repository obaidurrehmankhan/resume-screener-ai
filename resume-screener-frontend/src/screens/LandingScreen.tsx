import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";

export default function LandingScreen() {
    return (
        <div className="bg-background text-foreground transition-colors duration-300">
            {/* Hero */}
            <section className="py-24">
                <Container className="text-center max-w-3xl">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
                        AI-Powered Resume Screener
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Instantly analyze your resume and get job-specific feedback.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow hover:opacity-90 transition"
                    >
                        Get Started
                    </Link>
                </Container>
            </section>

            {/* Features */}
            <section className="py-20 bg-muted text-muted-foreground">
                <Container className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon="✅"
                        title="Match Score"
                        description="View how well you match a job description"
                    />
                    <FeatureCard
                        icon="💡"
                        title="AI Feedback"
                        description="Discover areas for resume improvement"
                    />
                    <FeatureCard
                        icon="📄"
                        title="Resume rewriting"
                        description="Generate an updated resume with AI"
                    />
                </Container>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary text-primary-foreground text-center">
                <Container>
                    <h2 className="text-3xl font-bold mb-3">Ready to stand out?</h2>
                    <p className="text-lg mb-6">
                        Let AI optimize your resume and land more interviews—no guesswork.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-background text-primary px-6 py-3 rounded-xl shadow hover:opacity-90 transition"
                    >
                        Start for Free
                    </Link>
                </Container>
            </section>
        </div>
    );
}

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) => {
    return (
        <div className="p-6 rounded-xl bg-card text-card-foreground shadow hover:shadow-md transition">
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};
