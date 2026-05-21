import { motion } from "framer-motion"
import { useState } from "react"
import FaqItem from "./elements/FaqItem"

export default function FAQ() {
    const [open, setOpen] = useState("item1")
    return (
        <s-section>
            <s-heading>Frequently asked questions</s-heading>
            <s-stack>
                <FaqItem
                    isOpen={open === "item1"}
                    onToggle={() => setOpen("item1")}
                    title="Why isn't the currency switcher showing on my store?"
                >
                    <s-paragraph>
                        Two things to check. First, make sure the app is turned on from the dashboard. Second, go to Shopify <b>Admin → Online Store → Themes → Customize → App embeds</b> and confirm DemoApp is toggled on. Both need to be active for the widget to appear.
                    </s-paragraph>
                </FaqItem>
                <FaqItem
                    isOpen={open === "item2"}
                    onToggle={() => setOpen("item2")}
                    title="Why aren't my product prices converting?"
                >
                    <s-paragraph>
                        Check your theme's <b>Settings → Languages</b>. If you have multiple languages enabled, Shopify might be using the theme's built-in converter instead of the app. Disable the theme's converter and ensure the app is the primary currency tool.
                    </s-paragraph>
                </FaqItem>
                <FaqItem
                    isOpen={open === "item3"}
                    onToggle={() => setOpen("item3")}
                    title="How often do exchange rates update?"
                >
                    <s-paragraph>
                        Rates update automatically every 6 hours using the latest data from the European Central Bank. You can also manually refresh rates from the dashboard at any time.
                    </s-paragraph>
                </FaqItem>
                <FaqItem
                    isOpen={open === "item4"}
                    onToggle={() => setOpen("item4")}
                    title="Can I control which pages the widget appears on?"
                    bordered={false}
                >
                    <s-paragraph>
                        Yes. From the <b>Settings</b> tab, you can choose to show the currency switcher on all pages, or only on specific pages like the homepage, product pages, or collection pages.
                    </s-paragraph>
                </FaqItem>
            </s-stack>
        </s-section>
    )
}