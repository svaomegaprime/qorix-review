import { useState } from "react"
import FaqItem from "./elements/FaqItem"

const FAQ_ITEMS = [
    {
        title: "How do I start collecting reviews?",
        desc: "After installing the app, go to Requests in the sidebar and enable automatic review requests. Qorix will automatically email your customers after their order is fulfilled."
    },
    {
        title: "Why are my reviews not showing on my store?",
        desc: "Make sure the app embed is enabled in your Shopify theme editor. Go to <b>Online Store → Themes → Customize → App embeds</b> and toggle on Qorix Review. Also confirm the Review Widget block is added to your product page template."
    },
    {
        title: "Can I control which reviews are published?",
        desc: "Yes. Go to <b>Settings → Publishing & moderation</b>. You can auto-publish all reviews, only verified purchase reviews, or hold low-star reviews (1–2 stars) for manual approval before they go live."
    },
    {
        title: "How do I change when the review request email is sent?",
        desc: "Go to <b>Settings → Request scheduling</b>. You can set the delay between order fulfilment and the email. We recommend 7 to 14 days to give customers enough time to use the product before reviewing."
    }
]

export default function FAQ() {
    const [open, setOpen] = useState("item1")
    return (
        <s-section>
            <s-heading>Frequently asked questions</s-heading>
            <s-stack>
                {FAQ_ITEMS.map((item, index) => (
                    <FaqItem
                        isOpen={open === `item${index + 1}`}
                        onToggle={() => setOpen(`item${index + 1}`)}
                        title={item.title}
                        bordered={index === FAQ_ITEMS.length - 1 ? false : true}
                        key={index}
                    >
                        <s-paragraph 
                            dangerouslySetInnerHTML={{__html: item.desc}}
                        />
                    </FaqItem>
                ))}
            </s-stack>
        </s-section>
    )
}