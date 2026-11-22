import json,subprocess,sys
def call(m,args=''):
    c=['dfx','canister','call','--output','json','backend',m]+([args] if args else [])
    r=subprocess.run(c,capture_output=True,text=True)
    try: return json.loads(r.stdout)
    except Exception: return {'raw':r.stdout+r.stderr}
def n(x): return int(str(x).replace('_',''))
q=int(sys.argv[1]); ch=sys.argv[2]
call('initializePlayer','("v","V")')
for i in range(5): call('advancePhase')
call('debugSetInventory',f'({q} : nat, 0 : nat)')
f=call('getPlayerFarm')['Ok']
r=call('sellCherries',f'({q} : nat, "{ch}")')
print(f"{ch:9s} {q:>6} kg  season={list(f['currentSeason'])[0]} phase={list(f['currentPhase'])[0]}  revenue={r} ")
if 'Ok' in r: print(f"          -> {n(r['Ok'])/q:.2f} PLN/kg")
