"""add_missing_templates.py — Add missing niche templates to both configs"""
import json, os

MISSING_NICHES = {
    "ent": {
        "subject": "Quick website audit for {business_name} — ENT & ear clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found a few issues affecting how patients find you online:\n\n{website_issues}\n\nPatients in {city} searching for ENT specialists increasingly book online. Clinics with modern, mobile-friendly websites and online booking see significantly more new patient enquiries.\n\nI'm an AI & web automation engineer who builds modern clinic websites with online booking and automated patient reminders.\n\nSee a live example:\n{promo_url}\n\nAre you open to a quick 5-minute call to see how I can help {business_name}?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "ophthalmology": {
        "subject": "Quick website audit for {business_name} — Eye clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and noticed a few technical gaps:\n\n{website_issues}\n\nPatients in {city} searching for eye specialists often book based on their first website impression. I build mobile-first eye clinic websites with online booking and automated appointment reminders.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call this week?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "orthopedic": {
        "subject": "Quick website audit for {business_name} — Orthopaedic clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical issues that may be limiting new patient bookings:\n\n{website_issues}\n\nPatients with bone & joint issues in {city} often search online before choosing a specialist. A modern website with online booking can significantly increase new patient flow.\n\nI build clinic websites with online booking and automated patient reminders for orthopaedic practices.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "pediatrics": {
        "subject": "Quick website audit for {business_name} — Paediatric clinic",
        "body": "Hi there,\n\nI reviewed {business_name}'s website ({website_url}) and found some areas that may be affecting how parents find and book appointments:\n\n{website_issues}\n\nParents in {city} searching for paediatricians expect a fast, mobile-friendly website with easy online booking. Clinics that offer this see more new patient registrations.\n\nI build modern paediatric clinic websites with online booking and automated reminders.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "gynecology": {
        "subject": "Quick website audit for {business_name} — Women's health clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical gaps:\n\n{website_issues}\n\nPatients in {city} searching for gynaecology & women's health services increasingly prefer clinics with easy online booking and a professional web presence.\n\nI build modern women's health clinic websites with discreet online booking and automated appointment reminders.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "neurology": {
        "subject": "Quick website audit for {business_name} — Neurology clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found a few issues affecting patient experience:\n\n{website_issues}\n\nNeurology patients in {city} often research specialists online before booking. A professional, mobile-optimised website with online booking can significantly increase new patient enquiries.\n\nI build modern clinic websites for neurology practices with automated booking and patient follow-ups.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "psychiatry": {
        "subject": "Quick website audit for {business_name} — Mental health clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical areas to improve:\n\n{website_issues}\n\nPatients seeking mental health support in {city} often take extra time researching their provider online. A calming, professional website with discreet online booking builds trust and increases new patient conversions.\n\nI build mental health clinic websites with secure online booking and automated appointment reminders.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "urology": {
        "subject": "Quick website audit for {business_name} — Urology clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical issues:\n\n{website_issues}\n\nPatients in {city} looking for urology specialists prefer discreet, professional online booking. A mobile-friendly clinic website with automated booking can meaningfully increase your new patient flow.\n\nI build modern urology clinic websites with online booking and automated patient reminders.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "gastro": {
        "subject": "Quick website audit for {business_name} — Gastroenterology clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found a few technical gaps:\n\n{website_issues}\n\nGastroenterology patients in {city} often search online before booking consultations. A professional, mobile-optimised website with online booking increases new patient registrations.\n\nI build modern gastroenterology clinic websites with automated appointment booking and patient reminders.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "diabetes": {
        "subject": "Quick website audit for {business_name} — Diabetes & endocrinology clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some issues affecting patient experience:\n\n{website_issues}\n\nDiabetes and endocrinology patients in {city} often need frequent follow-up appointments. A clinic with online booking and automated reminders sees better patient retention and new referrals.\n\nI build modern diabetes clinic websites with automated booking and appointment reminders.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "physio": {
        "subject": "Quick website audit for {business_name} — Physiotherapy clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical gaps:\n\n{website_issues}\n\nPhysiotherapy patients in {city} often need to book recurring sessions. A mobile-friendly website with online booking and automated session reminders significantly reduces no-shows and increases bookings.\n\nI build modern physiotherapy clinic websites with automated booking and patient reminders.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "hair": {
        "subject": "Quick website audit for {business_name} — Hair clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical issues:\n\n{website_issues}\n\nHair clinic patients in {city} research and compare clinics online extensively before booking. A modern, professional website with online consultation booking and before/after galleries significantly increases patient enquiries.\n\nI build modern hair clinic websites with automated booking and patient follow-up systems.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "weightloss": {
        "subject": "Quick website audit for {business_name} — Weight loss clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some areas to improve:\n\n{website_issues}\n\nWeight loss clinic patients in {city} often research multiple providers online before booking a consultation. A professional website with clear before/after results and easy online booking significantly increases conversion.\n\nI build modern weight loss clinic websites with automated booking and patient follow-up systems.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "ivf": {
        "subject": "Quick website audit for {business_name} — IVF & fertility clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical gaps that may be affecting patient enquiries:\n\n{website_issues}\n\nCouple seeking IVF & fertility treatment in {city} research providers extensively online. A professional, empathetic website with easy online consultation booking builds trust and increases new enquiries.\n\nI build modern fertility clinic websites with automated booking and sensitive patient communication systems.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "oncology": {
        "subject": "Quick website audit for {business_name} — Oncology clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical issues:\n\n{website_issues}\n\nCancer patients and their families in {city} research oncology specialists online very carefully. A professional, reassuring website with easy appointment scheduling can meaningfully improve patient access to care.\n\nI build modern oncology clinic websites with automated appointment booking and patient communication systems.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "nephrology": {
        "subject": "Quick website audit for {business_name} — Kidney & nephrology clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical gaps:\n\n{website_issues}\n\nKidney disease patients in {city} often need regular monitoring appointments. A mobile-friendly website with online booking and automated appointment reminders reduces administrative burden and increases patient retention.\n\nI build modern nephrology clinic websites with automated booking and patient follow-up systems.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "pulmonology": {
        "subject": "Quick website audit for {business_name} — Pulmonology & chest clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical issues:\n\n{website_issues}\n\nRespiratory patients in {city} increasingly search for pulmonologists online. A professional website with mobile-friendly design and online booking significantly increases new patient enquiries.\n\nI build modern pulmonology clinic websites with automated booking and patient reminders.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "rheumatology": {
        "subject": "Quick website audit for {business_name} — Rheumatology clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical gaps:\n\n{website_issues}\n\nRheumatology patients in {city} often need regular long-term care. A professional clinic website with online booking and automated appointment reminders significantly improves patient retention and new referrals.\n\nI build modern rheumatology clinic websites with automated booking and patient communication systems.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "cosmetic": {
        "subject": "Quick website audit for {business_name} — Cosmetic clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical issues:\n\n{website_issues}\n\nCosmetic clinic patients in {city} research providers online extensively, comparing results and reviews before booking. A premium, visually impressive website with online consultation booking and before/after galleries significantly increases enquiries.\n\nI build modern cosmetic clinic websites with automated booking and patient follow-up systems.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "homeopathy": {
        "subject": "Quick website audit for {business_name} — Homeopathy clinic",
        "body": "Hi there,\n\nI audited {business_name}'s website ({website_url}) and found some technical areas to improve:\n\n{website_issues}\n\nPatients seeking homeopathy in {city} often prefer clinics with a professional online presence and easy appointment booking. A modern website with online booking can significantly increase new patient enquiries.\n\nI build modern homeopathy clinic websites with automated booking and patient communication systems.\n\nSee a live demo:\n{promo_url}\n\nWould you be open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
    "ayurveda": {
        "subject": "Quick website audit for {business_name} — Ayurveda clinic",
        "body": "Hi there,\n\nI ran a quick audit of {business_name}'s website ({website_url}) and found some technical gaps:\n\n{website_issues}\n\nAyurveda patients in {city} increasingly search online for authentic practitioners. A professional, calming website with online consultation booking significantly increases new patient enquiries and builds trust.\n\nI build modern Ayurveda clinic websites with automated booking and patient communication systems.\n\nSee a live demo:\n{promo_url}\n\nAre you open to a quick 5-minute call?\n\nBest regards,\nAditya Tyagi\nAI & Automation Engineer"
    },
}

def add_templates_to_config(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    templates = config.setdefault('email_templates', {})
    added = []
    for niche, tmpl in MISSING_NICHES.items():
        if niche not in templates:
            templates[niche] = tmpl
            added.append(niche)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {config_path}: added templates for {added}")
    return len(added)

# Update both configs
base = os.path.dirname(os.path.abspath(__file__))
configs = [
    os.path.join(base, 'global-outreach', 'config.json'),
    os.path.join(base, 'india-outreach', 'config.json'),
]

for cfg_path in configs:
    if os.path.exists(cfg_path):
        n = add_templates_to_config(cfg_path)
        print(f"  -> Added {n} templates")
    else:
        print(f"  -> NOT FOUND: {cfg_path}")

print("Done!")
