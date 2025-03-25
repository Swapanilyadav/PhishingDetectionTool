import re
import whois
import tldextract
import urllib.parse
import numpy as np
import pandas as pd
import nltk
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import accuracy_score


nltk.download('stopwords')
from nltk.corpus import stopwords


SPAM_WORDS = ['urgent', 'click', 'verify', 'password', 'account', 'login', 'free', 'credit card', 'bank', 'suspended']


def extract_url_features(url):
    parsed_url = urllib.parse.urlparse(url)
    
    # Feature 1: URL Length
    url_length = len(url)
    
    # Feature 2: Number of Special Characters
    special_chars = sum(1 for char in url if char in ['@', '-', '_', '.', '=', '&'])
    
    # Feature 3: Presence of IP in URL
    ip_present = bool(re.match(r'^\d{1,3}(\.\d{1,3}){3}', parsed_url.netloc))
    
    # Feature 4: Domain Age
    try:
        domain_info = whois.whois(parsed_url.netloc)
        if isinstance(domain_info.creation_date, list):
            domain_age = (pd.Timestamp.today() - pd.to_datetime(domain_info.creation_date[0])).days
        else:
            domain_age = (pd.Timestamp.today() - pd.to_datetime(domain_info.creation_date)).days
    except:
        domain_age = 0  # If WHOIS fails, assume newly created domain
    
    # Feature 5: HTTPS usage
    https_used = 1 if parsed_url.scheme == 'https' else 0
    
    return [url_length, special_chars, ip_present, domain_age, https_used]

# Extract features from an email
def extract_email_features(email_text):
    words = email_text.lower().split()
    
    # Feature 1: Spam Word Probability
    spam_count = sum(1 for word in words if word in SPAM_WORDS)
    spam_probability = spam_count / len(words) if words else 0
    
    return [spam_probability]

# Create a dataset (for training the model)
data = [
    ["http://paypal-security-alert.com/verify", 45, 5, 1, 30, 0, 0.12, 1],  # Phishing
    ["https://secure.bankofamerica.com/login", 40, 2, 0, 5000, 1, 0.01, 0],  # Legitimate
    ["http://free-giftcards123.com", 35, 4, 1, 15, 0, 0.18, 1],  # Phishing
    ["https://google.com", 20, 1, 0, 10000, 1, 0.00, 0],  # Legitimate
]

columns = ["URL", "Length", "SpecialChars", "IPPresent", "DomainAge", "HTTPS", "SpamProb", "Label"]
df = pd.DataFrame(data, columns=columns)

# Train a Random Forest Classifier
X = df.drop(columns=["URL", "Label"])
y = df["Label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Test the model
y_pred = model.predict(X_test)
print(f"Model Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")

# Function to predict phishing
def detect_phishing(url, email_text):
    url_features = extract_url_features(url)
    email_features = extract_email_features(email_text)
    input_features = np.array(url_features + email_features).reshape(1, -1)
    
    prediction = model.predict(input_features)[0]
    probability = model.predict_proba(input_features)[0][1]  # Probability of phishing
    
    print(f"\n🔍 URL: {url}")
    print(f"📧 Email Snippet: {email_text[:50]}...")
    print(f"⚠️ Phishing Probability: {probability * 100:.2f}%")
    print("🚨 Warning: This is likely a PHISHING attempt!" if prediction == 1 else "✅ Safe: This appears legitimate.")

# Example Usage
test_url = "http://paypal-security-alert.com/verify"
test_email = "Dear customer, your PayPal account is suspended. Click below to verify now!"
detect_phishing(test_url, test_email)
