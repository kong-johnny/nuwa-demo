import getpass
from pathlib import Path
key=getpass.getpass('Zhipu API Key (hidden): ').strip()
if not key: raise SystemExit('Empty key')
(Path(__file__).parent/'.local-key').write_text(key,encoding='utf-8')
print('Saved local server configuration; key not printed.')
