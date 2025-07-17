import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function LandingPage() {
    return (
        <div className="bg-slate-light min-h-screen text-slate p-8">
            {/* Top Heading */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-center mb-4"
            >
                AI-Powered Resume Screener
            </motion.h1>
            <p className="text-center text-lg mb-6">
                Instantly analyze your resume and get job-specific feedback.
            </p>

            {/* Get Started Button */}
            <div className="text-center mb-10">
                <Button className="bg-crimson hover:bg-crimson-light text-white text-lg px-6 py-3">
                    Get Started
                </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                    {
                        title: "Match Score",
                        desc: "View how well you match a job description",
                        icon: "✅",
                    },
                    {
                        title: "AI Feedback",
                        desc: "Discover areas for resume improvement",
                        icon: "💡",
                    },
                    {
                        title: "Resume rewriting",
                        desc: "Generate an updated resume with AI",
                        icon: "📄",
                    },
                ].map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        viewport={{ once: true }}
                        className="rounded-lg border p-6 text-center shadow-sm bg-white"
                    >
                        <div className="text-4xl mb-2 text-crimson">{feature.icon}</div>
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                    </motion.div>
                    // <div
                    //     key={feature.title}
                    //     className="rounded-lg border p-6 text-center shadow-sm bg-white"
                    // >

                    // </div>
                ))}
            </div>
        </div>
    )
}
