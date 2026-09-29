import subprocess

scripts = [
    'scratch/verify_categories.py',
    'scratch/verify_ip_coverage.py',
    'scratch/verify_regulatory.py',
    'scratch/verify_claims.py',
    'scratch/verify_label.py',
    'scratch/verify_international.py',
    'scratch/verify_expert.py',
    'scratch/verify_source_gov.py'
]

all_ok = True
for s in scripts:
    res = subprocess.run(['.\\backend\\venv\\Scripts\\python.exe', s], capture_output=True, text=True)
    status = 'OK' if res.returncode == 0 else f'FAIL: {res.stderr[:200]}'
    print(f'{s}: {status}')
    if res.returncode != 0:
        all_ok = False

if all_ok:
    print('ALL VERIFICATION SCRIPTS PASSED.')
else:
    print('SOME SCRIPTS FAILED.')
