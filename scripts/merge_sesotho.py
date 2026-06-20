import json
import re
import os

def clean_string(s):
    if not s: return ''
    return re.sub(r'[^a-z0-9]', '', s.lower())

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    old_file = os.path.join(base_dir, 'src', 'data', 'hymns.json')
    new_file = os.path.join(base_dir, 'src', 'data', 'hymns_sesotho.json')
    
    with open(old_file, 'r', encoding='utf-8') as f:
        old_data = json.load(f)
        
    with open(new_file, 'r', encoding='utf-8') as f:
        new_data = json.load(f)
        
    old_dict = {clean_string(h.get('title', '')): h for h in old_data}
    
    merged_data = list(old_data) # Copy all old hymns
    added_count = 0
    
    for h in new_data:
        c_title = clean_string(h.get('title', ''))
        if c_title not in old_dict:
            # Check if there's a partial match to avoid duplicates with different punctuation
            is_dup = False
            for old_t in old_dict.keys():
                if len(c_title) > 5 and len(old_t) > 5:
                    if c_title in old_t or old_t in c_title:
                        is_dup = True
                        break
            
            if not is_dup:
                merged_data.append(h)
                added_count += 1
                
    print(f"Old count: {len(old_data)}")
    print(f"Added from new scrape: {added_count}")
    print(f"Total merged count: {len(merged_data)}")
    
    # Overwrite the old hymns.json with the unified list!
    with open(old_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    main()
