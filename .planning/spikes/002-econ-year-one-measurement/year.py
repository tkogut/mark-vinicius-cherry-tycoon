import json,subprocess,sys,re
def call(m,args='',q=False):
    c=['dfx','canister','call','--output','json']+(['--query'] if q else [])+['backend',m]+([args] if args else [])
    r=subprocess.run(c,capture_output=True,text=True)
    try: return json.loads(r.stdout)
    except Exception: return {'raw':r.stdout+r.stderr}
def n(x): return int(str(x).replace('_',''))
def farm(): return call('getPlayerFarm',q=True)['Ok']
def snap(tag):
    f=farm(); s=f['statistics']
    print(f"{tag:28s} {list(f['currentPhase'])[0]:11s} {list(f['currentSeason'])[0]:6s} cash={n(f['cash']):>7} costs={n(s['totalCosts']):>6} rev={n(s['totalRevenue']):>6} fert={n(f['inventory']['fertilizers'])} cherries={n(f['inventory']['cherries'])}")
    return f
hire=sys.argv[1]; pid=None
call('initializePlayer','("m","M")')
f=farm(); pid=f['parcels'][0]['id']; print('parcel',pid,'trees',f['parcels'][0]['plantedTrees'],'ha',f['parcels'][0]['size'])
snap('start')
for i in range(10):
    ph=list(farm()['currentPhase'])[0]
    out=''
    if ph=='Hiring' and hire!='none': out=call('hireLabor',f'("{hire}")')
    if ph=='Investment':
        out=[call('waterParcel',f'("{pid}")'),call('fertilizeParcel',f'("{pid}","SyntheticStandard")')]
    if ph=='Harvest': out=call('harvestCherries',f'("{pid}")')
    if ph=='Market':
        inv=farm()['inventory']; c=n(inv['cherries'])
        h=c//2
        r1=call('sellCherries',f'({h} : nat, "retail")'); r2=call('sellCherries',f'({c-h} : nat, "wholesale")')
        out=(c,h,r1,r2)
    if out: print('   ',ph,json.dumps(out)[:200])
    snap(f'after {ph}')
    call('advancePhase')
f=snap('end of year')
s=f['statistics']
for r in s['seasonalReports']:
    print({k:(n(v) if isinstance(v,(str,int)) else v) for k,v in r.items() if k in('season','laborCosts','operationalCosts','maintenanceCosts','certificationCosts','totalCosts','totalRevenue','totalHarvested')})
