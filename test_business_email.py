import smtplib

user = "business.n8n25@gmail.com"
passwords = ["gtea ikdk yoat jekq", "gteaikdkyoatjekq"]

print("--- Testing business.n8n25@gmail.com SMTP Login ---")
working = False
for pw in passwords:
    try:
        print(f"Attempting login with password: '{pw}'")
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.ehlo()
        server.starttls()
        server.login(user, pw)
        print("✅ SUCCESS! business.n8n25@gmail.com IS WORKING!")
        server.quit()
        working = True
        break
    except Exception as e:
        print("❌ FAILED:", e)

if not working:
    print("\n⚠️ Account Status: Disabled or WebLoginRequired by Google.")
    print("Google requires generating a fresh App Password at https://myaccount.google.com/apppasswords")
