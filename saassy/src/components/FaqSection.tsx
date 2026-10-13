'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does Saassy integrate with Next.js App Router & API routes?',
      answer: 'Saassy provides native TypeScript SDKs and edge proxy middleware that wrap your Next.js API handlers automatically. You can deploy both frontend UI components and backend serverless endpoints with zero additional config.',
    },
    {
      question: 'Is my data secure when executing autonomous AI agent pipelines?',
      answer: 'Yes. All data payloads are encrypted in transit using TLS 1.3 and at rest with AES-256 encryption. Saassy operates under Zero-Trust principles, ensuring AI agent execution environments are strictly sandboxed per tenant.',
    },
    {
      question: 'Can I self-host Saassy or deploy on dedicated cloud infrastructure?',
      answer: 'Enterprise customers have full access to isolated VPC deployments on AWS, GCP, or Azure, as well as dedicated Kubernetes clusters managed by our infrastructure engineers.',
    },
    {
      question: 'What happens if I exceed my plan request volume limit?',
      answer: 'We do not hard-block your API requests. If you exceed your quota, your system continues running seamlessly, and additional requests are billed at a flat, transparent overage rate of $0.0001 per call.',
    },
    {
      question: 'Can I cancel or change my subscription at any time?',
      answer: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account workspace setting tab. We also offer a 14-day no-questions-asked refund policy.',
    },
  ];

  return (
    <section id="faq" className="section">
      <div className="container" style={{ maxWidth: '840px' }}>
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <HelpCircle size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Got Questions?</span>
          </div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">
            Everything you need to know about Saassy's architecture, security, and pricing.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  borderColor: isOpen ? 'var(--border-glow)' : 'var(--border-color)',
                }}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isOpen ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {faq.question}
                  </h3>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isOpen && (
                  <p style={{ marginTop: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
