import requests
from bs4 import BeautifulSoup
import json
import os
import re

languages = {
    "zulu": "http://mzansicatholichymns.org/isizulu-hymns/",
    "xhosa": "http://mzansicatholichymns.org/isixhosa-hymns/",
    "setswana": "http://mzansicatholichymns.org/setswana-hymns/",
    "sesotho": "http://mzansicatholichymns.org/sesotho-hymns/"
}

def clean_text(text):
    text = text.replace('\xa0', ' ').strip()
    return text

def scrape_language(lang_name, index_url):
    print(f"Scraping {lang_name} from {index_url}...")
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    try:
        response = requests.get(index_url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch {index_url}: {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')
    
    content_area = soup.find('div', class_='thumb-body') or soup.find('div', class_='entry-content')
    if not content_area:
        print("Could not find content area")
        return []

    hymns = []
    links = content_area.find_all('a', href=True)
    
    seen_urls = set()
    unique_links = []
    for a in links:
        url = a['href']
        if url.startswith('http://mzansicatholichymns.org/') and url not in seen_urls:
            if '-hymns/' in url:
                continue
            seen_urls.add(url)
            unique_links.append((url, a.text.strip()))

    count = 1
    for url, title in unique_links:
        print(f"  Fetching {count}/{len(unique_links)}: {title}")
        count += 1
        
        try:
            h_resp = requests.get(url, headers=headers)
            h_resp.raise_for_status()
            h_soup = BeautifulSoup(h_resp.content, 'html.parser')
            
            h1 = h_soup.find('h1', class_='entry-title')
            hymn_title = clean_text(h1.text) if h1 else title
            
            body = h_soup.find('div', class_='thumb-body') or h_soup.find('div', class_='entry-content')
            
            if not body:
                print(f"   -> No lyrics body found for {url}")
                continue
                
            paragraphs = body.find_all('p')
            lyrics_blocks = []
            for p in paragraphs:
                text = p.get_text(separator='\n').strip()
                # Skip navigation links or category headers
                if text and not "Click to proceed" in text and not "Category:" in text and not text.isupper() and len(text) > 2:
                    lyrics_blocks.append(clean_text(text))
            
            lyrics = "\n\n".join(lyrics_blocks)
            
            hymn_id = re.sub(r'[^a-z0-9]+', '-', hymn_title.lower()).strip('-')
            
            hymns.append({
                "id": hymn_id,
                "title": hymn_title,
                "lyrics": lyrics
            })
            
        except Exception as e:
            print(f"   -> Failed to fetch {url}: {e}")
            
    return hymns

os.makedirs('src/data', exist_ok=True)

for lang, url in languages.items():
    hymns_data = scrape_language(lang, url)
    if hymns_data:
        out_path = f'src/data/hymns_{lang}.json'
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(hymns_data, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(hymns_data)} hymns to {out_path}\n")
    else:
        print(f"Warning: No hymns found for {lang}\n")
