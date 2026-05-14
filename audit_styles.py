import os
import re
from collections import Counter

def get_class_names(directory):
    class_name_pattern = re.compile(r'className="([^"]+)"')
    all_class_names = []
    file_map = {}

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.jsx', '.ts', '.js')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        matches = class_name_pattern.findall(content)
                        for match in matches:
                            all_class_names.append(match)
                            if match not in file_map:
                                file_map[match] = set()
                            file_map[match].add(path)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    
    return all_class_names, file_map

def parse_numeric(utility):
    # Matches text-[32px], p-[15px], rounded-[11px], w-[240px], etc.
    match = re.search(r'\[([\d.]+)([a-z%]+)\]', utility)
    if match:
        return float(match.group(1)), match.group(2)
    return None, None

def is_similar_utility(u1, u2):
    if u1 == u2:
        return True
    
    # Check for numeric closeness
    v1, unit1 = parse_numeric(u1)
    v2, unit2 = parse_numeric(u2)
    
    if v1 is not None and v2 is not None and unit1 == unit2:
        # Same utility family (prefix before [)
        prefix1 = u1.split('[')[0]
        prefix2 = u2.split('[')[0]
        if prefix1 == prefix2:
            # Tolerance: absolute <= 2 or relative <= 6%
            diff = abs(v1 - v2)
            if diff <= 2:
                return True
            if max(v1, v2) > 0 and diff / max(v1, v2) <= 0.06:
                return True
    
    return False

def get_similarity(arr1, arr2):
    shared = 0
    for u1 in arr1:
        for u2 in arr2:
            if is_similar_utility(u1, u2):
                shared += 1
                break
    
    smaller_len = min(len(arr1), len(arr2))
    if smaller_len == 0: return 0
    return shared / smaller_len

def run_audit(directory):
    raw_classes, file_map = get_class_names(directory)
    
    # Filter trivial ones
    def is_trivial(s):
        utilities = s.split()
        if len(utilities) < 4:
            # Check for specific trivial combinations
            trivial_sets = [
                {'flex', 'items-center'},
                {'grid', 'gap-4'},
                {'text-sm', 'font-medium'},
                {'relative', 'overflow-hidden'}
            ]
            u_set = set(utilities)
            for t_set in trivial_sets:
                if t_set.issubset(u_set):
                    return True
            return len(utilities) < 3
        return False

    filtered_classes = [c for c in raw_classes if not is_trivial(c)]
    counts = Counter(filtered_classes)
    
    # Group by similarity
    unique_patterns = sorted(counts.keys(), key=lambda x: counts[x], reverse=True)
    groups = []
    seen = set()

    for p in unique_patterns:
        if p in seen:
            continue
        
        current_group = {
            'primary': p,
            'variants': [p],
            'total_count': counts[p],
            'files': file_map[p]
        }
        seen.add(p)
        
        arr1 = p.split()
        for other in unique_patterns:
            if other in seen:
                continue
            
            arr2 = other.split()
            if get_similarity(arr1, arr2) >= 0.8: # High similarity threshold
                current_group['variants'].append(other)
                current_group['total_count'] += counts[other]
                current_group['files'].update(file_map[other])
                seen.add(other)
        
        groups.append(current_group)

    # Sort groups by impact: (shared pattern length * total count)
    def impact_score(g):
        return len(g['primary'].split()) * g['total_count']

    groups.sort(key=impact_score, reverse=True)

    print("--- CANDIDATE EXTRACTION REPORT ---")
    for i, g in enumerate(groups[:25]):
        print(f"\n### Candidate {i+1}: {g['primary']}")
        print(f"Total Occurrences: {g['total_count']} in {len(g['files'])} files")
        print(f"Files: {', '.join(list(g['files'])[:3])}...")
        if len(g['variants']) > 1:
            print(f"Variants: {len(g['variants'])-1} near-matches found")
        print(f"Impact Score: {impact_score(g)}")

if __name__ == "__main__":
    run_audit('src')
