import urllib.request
import re
import json
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

BASE_URL = "https://ojs.abecbrasil.org.br"
ARCHIVE_URL = f"{BASE_URL}/abec/issue/archive"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_html(url, retries=3, delay=0.5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read().decode('utf-8', errors='replace')
        except Exception as e:
            if attempt == retries - 1:
                print(f"Error fetching {url}: {e}")
                return None
            time.sleep(delay)

def parse_archive():
    print(f"Fetching archive page: {ARCHIVE_URL}")
    html = fetch_html(ARCHIVE_URL)
    if not html:
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    issues = []
    
    for item in soup.select('.issues_archive li'):
        title_elem = item.select_one('h2 a.title')
        series_elem = item.select_one('.series')
        if title_elem:
            href = title_elem['href']
            title = title_elem.text.strip()
            series = series_elem.text.strip() if series_elem else ''
            
            issue_id_match = re.search(r'/issue/view/(\d+)', href)
            issue_id = issue_id_match.group(1) if issue_id_match else ''
            
            year_match = re.search(r'(20\d\d|19\d\d)', title + " " + series)
            year = int(year_match.group(1)) if year_match else None
            
            issues.append({
                'id': issue_id,
                'title': title,
                'series': series,
                'year': year,
                'url': href
            })
            
    print(f"Found {len(issues)} issues in archive.")
    return issues

def parse_article(art_url, issue, default_section=''):
    html = fetch_html(art_url)
    if not html:
        return None
    
    soup = BeautifulSoup(html, 'html.parser')
    
    meta_tags = {}
    for meta in soup.find_all('meta'):
        name = meta.get('name') or meta.get('property')
        content = meta.get('content')
        if name and content:
            meta_tags.setdefault(name, []).append(content.strip())
            
    art_id_match = re.search(r'/article/view/(\d+)', art_url)
    art_id = art_id_match.group(1) if art_id_match else (meta_tags.get('DC.Identifier', [''])[0])
    
    title = meta_tags.get('citation_title', [''])[0]
    if not title:
        page_title = soup.select_one('h1.page_title')
        title = page_title.text.strip() if page_title else ''
        
    alt_titles = [t for t in meta_tags.get('DC.Title.Alternative', []) if t != title]
    
    authors = meta_tags.get('citation_author', [])
    if not authors:
        authors = meta_tags.get('DC.Creator.PersonalName', [])
    if not authors:
        authors = [a.text.strip() for a in soup.select('.author_name')]
        
    affiliations = meta_tags.get('citation_author_institution', [])
    if not affiliations:
        affiliations = [a.text.strip() for a in soup.select('.author_affiliation')]
        
    abstract = meta_tags.get('citation_abstract', [''])[0]
    if not abstract:
        ab_elem = soup.select_one('.article_abstract, .abstract')
        if ab_elem:
            abstract = ab_elem.text.replace('Resumo', '').replace('Abstract', '').strip()
            
    doi = meta_tags.get('citation_doi', [''])[0] or meta_tags.get('DC.Identifier.DOI', [''])[0]
    if not doi:
        doi_elem = soup.select_one('.doi a, .item.doi .value a')
        if doi_elem:
            doi = doi_elem.text.strip().replace('https://doi.org/', '')
            
    year = issue.get('year')
    if not year:
        date_str = meta_tags.get('citation_date', [''])[0]
        y_match = re.search(r'20\d\d|19\d\d', date_str)
        if y_match:
            year = int(y_match.group(1))
            
    pdf_url = meta_tags.get('citation_pdf_url', [''])[0]
    if not pdf_url:
        galley_elem = soup.select_one('a.galley-link, .obj_galley_link')
        if galley_elem:
            pdf_url = galley_elem.get('href', '')
            
    keywords = meta_tags.get('citation_keywords', [])
    if not keywords:
        raw_kw = meta_tags.get('DC.Subject', [])
        for k in raw_kw:
            parts = [p.strip() for p in k.split(';') if p.strip()]
            keywords.extend(parts)
    keywords = list(dict.fromkeys(keywords))
    
    section = meta_tags.get('DC.Type.articleType', [''])[0] or default_section
    
    references = meta_tags.get('citation_reference', [])
    if not references:
        ref_elems = soup.select('.author_reference, .references p, .references li')
        references = [r.text.strip() for r in ref_elems if r.text.strip()]
        
    rights = meta_tags.get('DC.Rights', [])
    license_str = rights[1] if len(rights) > 1 else (rights[0] if rights else "CC-BY 4.0")
    
    first_page = meta_tags.get('citation_firstpage', [''])[0]
    last_page = meta_tags.get('citation_lastpage', [''])[0]
    pages = f"{first_page}-{last_page}" if first_page and last_page else meta_tags.get('DC.Identifier.pageNumber', [''])[0]
    
    article_data = {
        "id": art_id,
        "doi": doi if (doi and doi.strip()) else "N/A",
        "title": title,
        "alternative_titles": alt_titles,
        "authors": authors,
        "affiliations": affiliations,
        "abstract": abstract,
        "keywords": keywords,
        "year": year or 2025,
        "issue": issue['title'],
        "issue_id": issue['id'],
        "section": section,
        "pages": pages,
        "url": art_url,
        "pdf_url": pdf_url,
        "references": references,
        "license": license_str,
        "data_sources": ["ABEC Brasil OJS"],
        "tools": ["Open Journal Systems"]
    }
    
    return article_data

def parse_issue_articles(issue):
    html = fetch_html(issue['url'])
    if not html:
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    article_tasks = []
    
    sections = soup.select('.section')
    if sections:
        for section in sections:
            sec_title_elem = section.select_one('h2, h3')
            sec_title = sec_title_elem.text.strip() if sec_title_elem else ''
            for art in section.select('.obj_article_summary'):
                t_elem = art.select_one('.title a')
                if t_elem:
                    article_tasks.append((t_elem['href'], issue, sec_title))
    else:
        for art in soup.select('.obj_article_summary'):
            t_elem = art.select_one('.title a')
            if t_elem:
                article_tasks.append((t_elem['href'], issue, ''))
                
    return article_tasks

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    data_dir = os.path.join(project_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    issues = parse_archive()
    all_article_tasks = []
    
    print("Collecting article links from all issues...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(parse_issue_articles, issue): issue for issue in issues}
        for future in as_completed(futures):
            tasks = future.result()
            all_article_tasks.extend(tasks)
            
    print(f"Total article links collected across all issues: {len(all_article_tasks)}")
    
    all_articles = []
    print("Scraping article metadata in parallel (12 workers)...")
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = [executor.submit(parse_article, task[0], task[1], task[2]) for task in all_article_tasks]
        for idx, future in enumerate(as_completed(futures), 1):
            art = future.result()
            if art:
                all_articles.append(art)
            if idx % 25 == 0 or idx == len(all_article_tasks):
                print(f"  [{idx}/{len(all_article_tasks)}] articles processed...")
                
    elapsed = time.time() - start_time
    print(f"Scraping completed in {elapsed:.2f} seconds!")
    
    # Sort articles by year descending, then title
    all_articles.sort(key=lambda x: (-x.get('year', 0), x.get('title', '')))
    
    output_file = os.path.join(data_dir, 'abec_articles.json')
    print(f"Saving {len(all_articles)} articles to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully scraped and digitized {len(all_articles)} articles!")

if __name__ == '__main__':
    main()
