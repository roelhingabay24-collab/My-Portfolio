import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AVAILABILITY, CONTACT } from '../data/site';
import { reveal } from '../lib/motion';
import ScrambleText from './ScrambleText';

const titleVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const titleLineVariants = {
  hidden: { y: '110%', opacity: 0, filter: 'blur(8px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  // Clipboard support is knowable at first render, so read it there rather than
  // in an effect that would trigger a second render.
  const [supported, setSupported] = useState(() => Boolean(navigator.clipboard?.writeText));
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!supported) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied: the Gmail link beside this still works.
      setSupported(false);
    }
  };

  return (
    <button type="button" className="copy-btn" onClick={copy}>
      <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      {copied ? 'Copied' : 'Copy'}
      <span className="sr-only" aria-live="polite">{copied ? 'Email address copied' : ''}</span>
    </button>
  );
}

function ContactForm() {
  const [state, setState] = useState('idle'); // idle | sending | sent | drafted | error
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: real people leave this hidden field empty.
    if (data.get('company')) return;

    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    if (!CONTACT.formAccessKey) {
      // No endpoint configured yet: hand off to the visitor's mail client with
      // everything prefilled, so the form still does its job today.
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
      window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
      setState('drafted');
      return;
    }

    setState('sending');
    setError('');
    try {
      data.set('access_key', CONTACT.formAccessKey);
      data.set('subject', `Portfolio enquiry from ${name}`);
      data.set('from_name', 'Roel Hingabay Portfolio');

      const response = await fetch(CONTACT.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(response.status === 429
          ? 'Too many attempts. Please wait a moment and try again.'
          : result.message || 'The message could not be sent. Please try again.');
      }
      form.reset();
      setState('sent');
    } catch (submitError) {
      setError(submitError.message);
      setState('error');
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
      <div className="field-row">
        <p className="field">
          <label htmlFor="cf-name">Name</label>
          <input id="cf-name" name="name" type="text" required autoComplete="name" />
        </p>
        <p className="field">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" name="email" type="email" required autoComplete="email" />
        </p>
      </div>
      <p className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows={4} required />
      </p>

      <p className="field honeypot" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </p>
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : CONTACT.formAccessKey ? 'Send message' : 'Open email draft'}
          {state !== 'sending' && <span aria-hidden="true">→</span>}
        </button>
        <p className="form-status" role="status" aria-live="polite">
          {state === 'sent' && 'Thank you. Your message has been sent, and I will get back to you shortly.'}
          {state === 'drafted' && 'Your email app should open a draft. Please review and send it there.'}
          {state === 'error' && `Could not send: ${error} Please email me directly.`}
        </p>
      </div>
    </form>
  );
}

export default function Contact({ reduceMotion }) {
  return (
    <section className="contact shell" id="contact" aria-labelledby="contact-title">
      <motion.div className="contact-intro" {...reveal(reduceMotion)}>
        <p className="eyebrow"><ScrambleText text="Contact" trigger="view" /></p>
        <motion.h2
          id="contact-title"
          className="contact-title"
          variants={titleVariants}
          initial={reduceMotion ? 'visible' : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.65 }}
        >
          <motion.span className="contact-title-line" variants={titleLineVariants}>Let&rsquo;s work</motion.span>
          <motion.span className="contact-title-line" variants={titleLineVariants}><em>together.</em></motion.span>
        </motion.h2>
        <p className="lede contact-lede">
          Open to {AVAILABILITY.roles} for {AVAILABILITY.openTo.toLowerCase()} work,
          {' '}{AVAILABILITY.arrangement.toLowerCase()}.
        </p>

      </motion.div>

      <motion.div className="contact-details" {...reveal(reduceMotion, 0.08)}>
        <p className="eyebrow"><ScrambleText text="Direct email" trigger="view" /></p>
        <div className="contact-email-row">
          <a
            className="contact-email"
            href={`mailto:${CONTACT.email}`}
            aria-label={`Email ${CONTACT.email}`}
          >
            {CONTACT.email} <span aria-hidden="true">↗</span>
          </a>
          <CopyEmail />
        </div>
        <p className="contact-details-note">Have a process to improve, an app to build, or a project to discuss? Send me a message.</p>
      </motion.div>

      <motion.div className="contact-form-wrap" {...reveal(reduceMotion, 0.14)}>
        <p className="eyebrow"><ScrambleText text="Send an inquiry" trigger="view" /></p>
        <ContactForm />
      </motion.div>
    </section>
  );
}
