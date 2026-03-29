
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Link } from 'react-router-dom'

export default function FAQSection() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How accurate is the legal information provided?',
            answer: 'LegalAi achieves 98% accuracy by retrieving answers strictly from the official Bharatiya Nyaya Sanhita (BNS), IPC, and Supreme Court judgments. Our RAG engine prevents hallucinations by citing verified sources for every claim.',
        },
        {
            id: 'item-2',
            question: 'Can I compare old IPC sections with new BNS laws?',
            answer: 'Yes! Our "Compare" feature allows you to instantly map sections from the Indian Penal Code (IPC) to the new Bharatiya Nyaya Sanhita (BNS), highlighting key changes, penalties, and illustrations side-by-side.',
        },
        {
            id: 'item-3',
            question: 'Is this tool a substitute for a lawyer?',
            answer: 'No. LegalAi is an assistive research tool designed to help lawyers, students, and citizens understand the law faster. It does not provide legal advice or representation in court.',
        },
        {
            id: 'item-4',
            question: 'Can I use it in Hindi or other languages?',
            answer: 'Yes, the platform supports bilingual queries (English & Hindi) to make legal knowledge accessible to a wider audience across India.',
        },
        {
            id: 'item-5',
            question: 'Where does the case law data come from?',
            answer: 'Our database indexes over 10,000 verified judgments from the Supreme Court of India and High Courts, updated regularly to ensure you cite the most relevant precedents.',
        },
    ]

    return (
        <section className="py-24 md:py-32 bg-white/50 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle tricolor accents for the section */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-white to-green-india opacity-30" />
            
            <div className="mx-auto max-w-5xl px-4 md:px-6 relative z-10">
                <div className="mx-auto max-w-4xl text-center mb-16">
                    <span className="micro-label mb-4 block">Knowledge Base</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif">Frequently Asked <span className="text-saffron">Questions</span></h2>
                    <p className="text-gray-600 mt-4 text-lg">
                        Clear answers about our AI, the new criminal laws, and how we ensure accuracy.
                    </p>
                </div>

                <div className="mx-auto mt-12 max-w-3xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-4"
                    >
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border border-gray-100 rounded-2xl bg-white px-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                            >
                                <AccordionTrigger className="cursor-pointer text-base md:text-lg hover:no-underline hover:text-saffron transition-colors text-left py-6 font-bold text-gray-900">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-gray-400 mt-12 text-center text-sm font-medium">
                        Still have questions? Chat with our{' '}
                        <Link
                            to="/chat"
                            className="text-saffron font-bold hover:underline">
                            AI Legal Assistant
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
