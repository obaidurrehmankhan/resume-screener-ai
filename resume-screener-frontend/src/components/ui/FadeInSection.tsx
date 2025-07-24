// ✨ Framer Motion: animation engine for React
import { motion, useAnimation, useInView } from 'framer-motion'

// 🧠 React hooks
import { useEffect, useRef } from 'react'

// 📦 FadeInSection — animates child content when it scrolls into view
export const FadeInSection = ({
    children,
    delay = 0.1,
    duration = 0.6,
}: {
    children: React.ReactNode       // 👶 What to animate
    delay?: number                  // ⏱️ Delay before animation starts (optional)
    duration?: number               // ⌛ How long the animation lasts (optional)
}) => {
    // 🧭 Create a reference to the DOM element
    const ref = useRef(null)

    // 👁️ Check if the element is in view (scroll into viewport)
    const inView = useInView(ref, {
        once: true,                   // ✅ Only trigger once (not every scroll)
        margin: "0px 0px -100px 0px" // 🔻 Trigger slightly before it's fully visible
    })

    // 🎬 Controls when to start animation
    const controls = useAnimation()

    // ⏱️ When the section becomes visible, start animation
    useEffect(() => {
        if (inView) {
            controls.start("visible")
        }
    }, [inView, controls])

    return (
        <motion.div
            ref={ref}                    // 📌 Connect DOM element for visibility check
            initial="hidden"            // 🔘 Initial state before animation
            animate={controls}          // ▶️ Control when animation starts
            transition={{ duration, delay }} // 🕐 Animation timing
            variants={{
                hidden: { opacity: 0, y: 50 }, // 👻 Fade in from below
                visible: { opacity: 1, y: 0 }, // 🌟 Settle into place
            }}
        >
            {children}
        </motion.div>
    )
}
