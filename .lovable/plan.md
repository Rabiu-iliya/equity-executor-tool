

# GadoPro — Islamic Inheritance Distribution Platform

## Overview
A full-stack web application for calculating and distributing inheritance according to Islamic (Faraid) law. Users can manage cases, define heirs and assets, get automatic Faraid-compliant share calculations, chat with GadoBot AI assistant, and export professional reports — all in 20 languages.

---

## 1. Authentication & User Management
- Email/password signup and login
- Google and Apple social sign-in via Supabase OAuth
- User profiles table (name, preferred language, avatar)
- Password reset flow with dedicated reset page

## 2. Database Schema (Supabase / Lovable Cloud)
- **profiles** — user display info, language preference
- **user_roles** — role-based access (admin, user) with security definer function
- **cases** — inheritance cases (deceased name, date, notes, total estate value, status: draft/calculated/distributed)
- **heirs** — linked to cases; stores heir name, relationship to deceased (e.g., son, daughter, wife, mother, father, brother, etc.), and calculated share
- **assets** — linked to cases; stores asset type (money, property, land, valuables), description, and value
- Full RLS policies: users can only access their own cases, heirs, and assets
- Auto-set `admin_id` from `auth.uid()` on insert

## 3. Islamic Inheritance (Faraid) Calculation Engine
- Implement Faraid share rules based on heir relationships:
  - Fixed shares (Fard) for spouses, parents, daughters, etc.
  - Residuary (Asaba) distribution
  - Handling of edge cases (e.g., no sons, multiple wives)
- Automatic calculation triggered when heirs and estate value are defined
- Clear breakdown showing each heir's fractional share and monetary amount

## 4. Core Features (Frontend)
- **Dashboard** — overview of all cases with status indicators
- **Case Management** — create, view, edit, delete cases
- **Heir Management** — add/remove heirs per case, select relationship type
- **Asset Management** — add/categorize assets (money, property, land, valuables) with values
- **Calculation View** — displays Faraid-compliant distribution with per-heir breakdown in a clear table
- **Report Export** — generate PDF/Excel reports with case summary, heir shares, and asset breakdown (in selected language)
- Modern, clean, professional UI — responsive and mobile-friendly

## 5. Multi-Language Support (20 Languages)
- i18n framework (react-i18next) with JSON translation files
- Language selector dropdown in the header
- All UI text, labels, buttons, notifications, tooltips, and error messages translated
- Supported languages: English, Chinese (Simplified), Spanish, Hindi, Arabic (RTL support), French, Bengali, Russian, Portuguese, Urdu (RTL support), Indonesian, Japanese, German, Swahili, Turkish, Tamil, Vietnamese, Korean, Italian, Thai
- Reports export in the user's selected language

## 6. GadoBot AI Assistant
- Powered by Lovable AI (via edge function)
- Floating chat widget accessible from any page
- Answers inheritance law questions, explains Faraid rules, and helps users understand share distributions
- Streaming responses for a smooth conversational experience
- Context-aware: can reference the current case data if applicable

## 7. Branding & Design
- Professional, trustworthy aesthetic with a clean color palette
- GadoPro logo/branding in header and reports
- Consistent typography and spacing throughout
- Dark mode support

