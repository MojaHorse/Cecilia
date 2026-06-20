import json
import os
import re

def clean_title(title):
    # Remove punctuation and lowercase
    t = re.sub(r'[^a-z0-9\s]', '', title.lower()).strip()
    return t

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'src', 'data')
    
    files = {
        'sesotho': 'hymns.json',
        'zulu': 'hymns_zulu.json',
        'xhosa': 'hymns_xhosa.json',
        'setswana': 'hymns_setswana.json'
    }
    
    # Load all data
    db = {}
    for lang, filename in files.items():
        filepath = os.path.join(data_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            db[lang] = json.load(f)
            # Initialize related_hymns array if not exists
            for h in db[lang]:
                h['related_hymns'] = []
                
    matches_found = 0
    
    def link_hymns(lang1, id1, lang2, id2):
        nonlocal matches_found
        # Find the hymns
        h1 = next((h for h in db[lang1] if h['id'] == id1), None)
        h2 = next((h for h in db[lang2] if h['id'] == id2), None)
        if h1 and h2:
            # Prevent duplicate links
            if not any(r['lang'] == lang2 and r['id'] == id2 for r in h1['related_hymns']):
                h1['related_hymns'].append({'lang': lang2, 'id': id2, 'title': h2['title']})
            if not any(r['lang'] == lang1 and r['id'] == id1 for r in h2['related_hymns']):
                h2['related_hymns'].append({'lang': lang1, 'id': id1, 'title': h1['title']})
            matches_found += 1

    # 1. Automatic matching between closely related languages (Sesotho <-> Setswana)
    # and (Zulu <-> Xhosa) using title similarity
    def auto_match(l1, l2):
        for h1 in db[l1]:
            t1 = clean_title(h1['title'])
            if not t1: continue
            for h2 in db[l2]:
                t2 = clean_title(h2['title'])
                if not t2: continue
                
                # Check for exact match or significant substring
                if t1 == t2 or (len(t1) > 8 and t1 in t2) or (len(t2) > 8 and t2 in t1):
                    link_hymns(l1, h1['id'], l2, h2['id'])

    auto_match('sesotho', 'setswana')
    auto_match('zulu', 'xhosa')
    
    # 2. Hardcoded Cross-Family Semantic Dictionary (Sotho-Tswana <-> Nguni)
    # Map of Sesotho/Tswana keywords to Zulu/Xhosa keywords
    dictionary = [
        (['ahe maria', 'ave maria', 'ahe anna', 'ahe josefa'], ['ave maria', 'ah ma mariya', 'amandla kajosef']),
        (['ntate oa rona', 'mopi oa rona'], ['baba wethu', 'mdali wethu', 'akatusw ubaba wethu']),
        (['tlong re ye kerekeng'], ['asiye esontweni']),
        (['moea o halalelang', 'moea'], ['moya oyingcwele', 'nakumoya ocwebile']),
        (['jesu monga rona', 'morena jesu'], ['jesu nkosi', 'nkosi yesu']),
        (['pelo ea jesu'], ['inhliziyo kayesu']),
        (['sakramente', 'sakramenteng'], ['amasakrament', 'isakramente'])
    ]
    
    sotho_langs = ['sesotho', 'setswana']
    nguni_langs = ['zulu', 'xhosa']
    
    for s_lang in sotho_langs:
        for n_lang in nguni_langs:
            for h_s in db[s_lang]:
                t_s = clean_title(h_s['title'])
                for h_n in db[n_lang]:
                    t_n = clean_title(h_n['title'])
                    
                    # Check dictionary
                    for s_keywords, n_keywords in dictionary:
                        s_match = any(kw in t_s for kw in s_keywords)
                        n_match = any(kw in t_n for kw in n_keywords)
                        if s_match and n_match:
                            link_hymns(s_lang, h_s['id'], n_lang, h_n['id'])
                            
    # Save back to files
    for lang, filename in files.items():
        filepath = os.path.join(data_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(db[lang], f, indent=2, ensure_ascii=False)
            
    print(f"Cross-referencing complete. Found {matches_found} total bilateral links.")

if __name__ == '__main__':
    main()
