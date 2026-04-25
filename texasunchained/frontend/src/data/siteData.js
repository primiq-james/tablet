import { articles } from "./articles.js";

export const navItems = [
  { label: "Shop", href: "./shop.html" },
  { label: "Join Movement", href: "./join.html", cta: true },
  { label: "Upcoming Events", href: "./events.html" },
];

export const platformPillars = [
  {
    kicker: "Economic Strength",
    title: "Keep capital, jobs, and leverage closer to home.",
    body: "A stronger Texas economy starts with disciplined growth, durable infrastructure, and strategic control that does not feel improvised.",
  },
  {
    kicker: "Energy Leadership",
    title: "Treat power, pipelines, and storage like strategic assets.",
    body: "Energy scale matters. Resilience, hardening, and delivery matter more when the pressure rises.",
  },
  {
    kicker: "Technology and AI",
    title: "Build around compute, chips, logistics, and applied AI.",
    body: "Technology should reinforce industrial strength, not sit in a slide deck as branding.",
  },
  {
    kicker: "Healthcare and Medical Growth",
    title: "Expand capacity, quality, and regional access.",
    body: "Healthcare works best when it feels reliable, available, and grounded in real operating capacity.",
  },
  {
    kicker: "Secure Borders and Fair Laws",
    title: "Prioritize logistics, enforcement, and legal clarity.",
    body: "Security should look operational, disciplined, and durable under pressure.",
  },
  {
    kicker: "Accountable Government",
    title: "Measure leaders by delivery, not posture.",
    body: "Competence, transparency, and visible results should set the standard for public trust.",
  },
];

export const trustPoints = [
  {
    chip: "Built by Texans",
    title: "Designed to feel grounded, serious, and local.",
    body: "The brand puts Texas at the center without drifting into hollow spectacle.",
  },
  {
    chip: "Focused on real solutions",
    title: "Energy, infrastructure, technology, healthcare, and public trust.",
    body: "The focus stays on systems people actually rely on, not filler language.",
  },
  {
    chip: "Driven by accountability",
    title: "Sharper standards. Less fluff. Clearer expectations.",
    body: "Every page should feel direct, modern, and disciplined instead of vague or overproduced.",
  },
];

export const trustStats = [
  { label: "State GDP", value: "$2.6T+", note: "Economic gravity that should be matched by governance." },
  { label: "Energy footprint", value: "#1", note: "A national advantage that still requires hardening and discipline." },
  { label: "Movement standard", value: "Zero fluff", note: "Every section should pull people toward action." },
];

export const movementPanels = [
  {
    title: "What Texas Unchained is",
    body: "A Texas-first brand and platform built to look serious, speak clearly, and feel stronger than a generic campaign site.",
  },
  {
    title: "What it stands for",
    body: "Strength, discipline, independence, and a cleaner standard for how the message is presented.",
  },
  {
    title: "Why now",
    body: "Because weak presentation kills momentum, and this needs to feel like a real movement instead of a placeholder.",
  },
];

export const mostRead = articles.filter((article) => article.mostRead).slice(0, 4);

export const latestUpdates = [...articles]
  .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
  .slice(0, 4);
