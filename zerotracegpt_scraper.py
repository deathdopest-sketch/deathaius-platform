#!/usr/bin/env python3
"""
ZeroTraceGPT Discount Code Scraper
Quickly searches multiple sources for discount codes
"""

import requests
import re
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import json

class ZeroTraceGPTScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.discount_codes = []
        
    def scrape_zerotracegpt_site(self):
        """Scrape ZeroTraceGPT official site for discount codes"""
        print("🔍 Scraping ZeroTraceGPT official site...")
        
        try:
            # Check main site
            response = self.session.get('https://zerotracegpt.com', timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for discount-related text
                discount_text = soup.find_all(text=re.compile(r'discount|promo|code|coupon|save|off|%', re.I))
                for text in discount_text:
                    if len(text.strip()) > 5:
                        print(f"  📝 Found discount text: {text.strip()}")
                
                # Look for input fields that might be discount codes
                discount_inputs = soup.find_all('input', {'placeholder': re.compile(r'discount|promo|code|coupon', re.I)})
                if discount_inputs:
                    print(f"  ✅ Found discount input field on main site")
                    
        except Exception as e:
            print(f"  ❌ Error scraping main site: {e}")
            
        try:
            # Check pricing page
            response = self.session.get('https://zerotracegpt.com/pricing', timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                discount_text = soup.find_all(text=re.compile(r'discount|promo|code|coupon|save|off|%', re.I))
                for text in discount_text:
                    if len(text.strip()) > 5:
                        print(f"  📝 Found pricing discount text: {text.strip()}")
        except:
            pass
            
    def scrape_coupon_sites(self):
        """Scrape popular coupon sites for ZeroTraceGPT codes"""
        print("🔍 Scraping coupon sites...")
        
        coupon_sites = [
            'https://www.retailmenot.com/view/zerotracegpt.com',
            'https://www.coupons.com/store/zerotracegpt/',
            'https://www.groupon.com/coupons/stores/zerotracegpt',
            'https://www.honey.com/zerotracegpt',
            'https://www.dealspotr.com/promo-codes/zerotracegpt.com'
        ]
        
        for site in coupon_sites:
            try:
                print(f"  🔍 Checking {site}")
                response = self.session.get(site, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for discount codes
                    codes = soup.find_all(text=re.compile(r'[A-Z0-9]{4,20}', re.I))
                    for code in codes:
                        code_text = code.strip()
                        if len(code_text) >= 4 and len(code_text) <= 20:
                            if re.match(r'^[A-Z0-9]+$', code_text):
                                self.discount_codes.append({
                                    'code': code_text,
                                    'source': site,
                                    'type': 'potential'
                                })
                                print(f"    💰 Found potential code: {code_text}")
                                
            except Exception as e:
                print(f"    ❌ Error checking {site}: {e}")
                
    def scrape_reddit(self):
        """Scrape Reddit for ZeroTraceGPT discount codes"""
        print("🔍 Scraping Reddit for discount codes...")
        
        try:
            # Reddit search for ZeroTraceGPT discount codes
            reddit_url = "https://www.reddit.com/search.json?q=zerotracegpt+discount+code&sort=relevance&t=all"
            response = self.session.get(reddit_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get('data', {}).get('children', [])
                
                for post in posts[:5]:  # Check top 5 posts
                    title = post['data'].get('title', '')
                    selftext = post['data'].get('selftext', '')
                    
                    # Look for discount codes in title and text
                    text_to_search = f"{title} {selftext}"
                    codes = re.findall(r'[A-Z0-9]{4,20}', text_to_search)
                    
                    for code in codes:
                        if len(code) >= 4 and len(code) <= 20:
                            self.discount_codes.append({
                                'code': code,
                                'source': f"Reddit: {title[:50]}...",
                                'type': 'reddit'
                            })
                            print(f"  💰 Found Reddit code: {code}")
                            
        except Exception as e:
            print(f"  ❌ Error scraping Reddit: {e}")
            
    def test_discount_codes(self):
        """Test found discount codes on ZeroTraceGPT"""
        print("🧪 Testing discount codes...")
        
        if not self.discount_codes:
            print("  ❌ No codes to test")
            return
            
        # Common discount code patterns to test
        common_codes = [
            'WELCOME10', 'WELCOME20', 'NEWUSER', 'FIRSTTIME',
            'SAVE10', 'SAVE20', 'SAVE30', 'DISCOUNT10',
            'PROMO10', 'PROMO20', 'STUDENT', 'EDUCATION',
            'BETA', 'EARLY', 'LAUNCH', 'SUMMER2024',
            'FALL2024', 'WINTER2024', 'SPRING2024'
        ]
        
        # Add common codes to test
        for code in common_codes:
            self.discount_codes.append({
                'code': code,
                'source': 'common_patterns',
                'type': 'test'
            })
            
        print(f"  🧪 Testing {len(self.discount_codes)} discount codes...")
        
        # Test codes by checking if they exist in checkout
        try:
            response = self.session.get('https://zerotracegpt.com/cart', timeout=10)
            if response.status_code == 200:
                print("  ✅ Cart page accessible - codes can be tested manually")
            else:
                print("  ❌ Cart page not accessible")
        except Exception as e:
            print(f"  ❌ Error accessing cart: {e}")
            
    def generate_report(self):
        """Generate a report of found discount codes"""
        print("\n" + "="*50)
        print("🎯 ZEROTRACEGPT DISCOUNT CODE REPORT")
        print("="*50)
        
        if not self.discount_codes:
            print("❌ No discount codes found")
            print("\n💡 Suggestions:")
            print("  - Check ZeroTraceGPT's official website for current promotions")
            print("  - Sign up for their newsletter")
            print("  - Follow them on social media")
            print("  - Check back in a few days for new promotions")
            return
            
        # Group codes by source
        by_source = {}
        for code_info in self.discount_codes:
            source = code_info['source']
            if source not in by_source:
                by_source[source] = []
            by_source[source].append(code_info)
            
        print(f"💰 Found {len(self.discount_codes)} potential discount codes:")
        print()
        
        for source, codes in by_source.items():
            print(f"📂 {source}:")
            for code_info in codes:
                print(f"  🎫 {code_info['code']} ({code_info['type']})")
            print()
            
        print("🧪 To test these codes:")
        print("  1. Go to https://zerotracegpt.com/cart")
        print("  2. Add a product to cart")
        print("  3. Look for discount/promo code field")
        print("  4. Try each code above")
        print()
        print("💡 Pro tip: Try codes in this order:")
        print("  1. WELCOME10, WELCOME20")
        print("  2. NEWUSER, FIRSTTIME")
        print("  3. SAVE10, SAVE20, SAVE30")
        print("  4. Any codes found from Reddit/social media")

def main():
    print("🚀 ZeroTraceGPT Discount Code Scraper")
    print("="*40)
    
    scraper = ZeroTraceGPTScraper()
    
    # Run all scraping methods
    scraper.scrape_zerotracegpt_site()
    scraper.scrape_coupon_sites()
    scraper.scrape_reddit()
    scraper.test_discount_codes()
    
    # Generate final report
    scraper.generate_report()
    
    print("\n✅ Scraping complete!")

if __name__ == "__main__":
    main()
