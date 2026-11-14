'use strict';
const KEY='home-os-v1',zones=['Kühlschrank','Gefrierschrank','Regal'],$=id=>document.getElementById(id);
let db={stock:[],shopping:[]};try{const s=JSON.parse(localStorage.getItem(KEY));if(s){db.stock=Array.isArray(s.stock)?s.stock:[];db.shopping=Array.isArray(s.shopping)?s.shopping:[]}}catch{}
let tab='lager',selected='Kühlschrank',editing=null,transferring=null;
const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=x=>Number(x).toLocaleString('de-DE',{maximumFractionDigits:3});
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch{alert('Speichern fehlgeschlagen.')}render()}
function switchTab(t){tab=t;$('lagerView').hidden=t!=='lager';$('einkaufView').hidden=t!=='einkauf';$('pageTitle').textContent=t==='lager'?'Lagerverwaltung':'Beschaffung';$('pageSub').textContent=t==='lager'?'Bestandskontrolle und Lagerplatzverwaltung':'Einkaufsplanung und Wareneingang';$('breadcrumb').textContent=t==='lager'?'INVENTORY MANAGEMENT':'PROCUREMENT';$('addBtn').textContent=t==='lager'?'+ ARTIKEL ERFASSEN':'+ EINKAUF HINZUFÜGEN';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));render()}
function openTransfer(item){
 if(Number(item.qty)<=0){alert('Für diesen Artikel ist kein Bestand verfügbar.');return;}
 transferring=item.id;
 $('transferName').textContent=item.name;
 $('transferAvailable').textContent='Verfügbar: '+fmt(item.qty)+' '+item.unit;
 $('transferSource').value=item.zone;
 $('transferDestination').value=zones.find(z=>z!==item.zone);
 $('transferQuantity').value=item.qty;
 $('transferQuantity').max=item.qty;
 $('transferDialog').showModal();
}
$('closeTransfer').addEventListener('click',()=>$('transferDialog').close());
$('transferDialog').addEventListener('close',()=>{transferring=null});
$('transferForm').addEventListener('submit',e=>{
 e.preventDefault();
 const item=db.stock.find(x=>x.id===transferring);
 if(!item){alert('Artikel nicht gefunden.');return;}
 const dest=$('transferDestination').value;
 const amount=Number($('transferQuantity').value);
 const available=Number(item.qty);
 if(!zones.includes(dest)||dest===item.zone){alert('Bitte einen anderen Lagerort wählen.');return;}
 if(!Number.isFinite(amount)||amount<=0||amount>available||Math.round(amount*1000)!==amount*1000){alert('Bitte eine gültige Menge (maximal drei Nachkommastellen) bis zum verfügbaren Bestand eingeben.');return;}
 const moved=Math.round(amount*1000)/1000;
 const existing=db.stock.find(x=>x.id!==item.id&&x.zone===dest&&x.unit===item.unit&&x.name.trim().toLocaleLowerCase('de-DE')===item.name.trim().toLocaleLowerCase('de-DE'));
 if(existing)existing.qty=Math.round((Number(existing.qty)+moved)*1000)/1000;
 else db.stock.push({id:uid(),name:item.name,qty:moved,unit:item.unit,zone:dest});
 item.qty=Math.max(0,Math.round((available-moved)*1000)/1000);
 if(item.qty===0)db.stock=db.stock.filter(x=>x.id!==item.id);
 $('transferDialog').close();
 save();
});

function render(){
$('total').textContent=String(db.stock.length).padStart(2,'0');$('zero').textContent=String(db.stock.filter(x=>Number(x.qty)===0).length).padStart(2,'0');zones.forEach(z=>$('c-'+z).textContent=db.stock.filter(x=>x.zone===z).length);$('zoneLabel').textContent=selected.toUpperCase();
const q=$('search').value.trim().toLowerCase(),list=db.stock.filter(x=>x.zone===selected&&String(x.name).toLowerCase().includes(q));$('resultCount').textContent=list.length+' Positionen';
$('stockRows').innerHTML=list.length?list.map((x,i)=>`<tr><td><span class="itemname">${esc(x.name)}</span><span class="sku">SKU-${String(i+1).padStart(4,'0')} · ${esc(x.zone)}</span></td><td><span class="qty">${fmt(x.qty)} ${esc(x.unit)}</span></td><td><span class="tag ${Number(x.qty)===0?'zero':''}">${Number(x.qty)===0?'LEER':'VERFÜGBAR'}</span></td><td><div class="actions"><button class="mini" data-a="minus" data-id="${esc(x.id)}" aria-label="Reduzieren">−</button><button class="mini" data-a="plus" data-id="${esc(x.id)}" aria-label="Erhöhen">+</button><button class="mini transfer" data-a="transfer" data-id="${esc(x.id)}" title="Umlagern" aria-label="Umlagern">⇄</button><button class="mini" data-a="edit" data-id="${esc(x.id)}" aria-label="Bearbeiten">✎</button><button class="mini danger" data-a="delete" data-id="${esc(x.id)}" aria-label="Löschen">×</button></div></td></tr>`).join(''):'<tr><td colspan="4" class="empty">Keine Artikel in dieser Lagerzone erfasst.</td></tr>';
const open=db.shopping.filter(x=>!x.done).length;$('openCount').textContent=String(open).padStart(2,'0');$('doneCount').textContent=String(db.shopping.length-open).padStart(2,'0');$('shopTotal').textContent=String(db.shopping.length).padStart(2,'0');
$('shopRows').innerHTML=db.shopping.length?db.shopping.map(x=>`<div class="shop-row ${x.done?'done':''}"><input type="checkbox" data-a="toggle" data-id="${esc(x.id)}" ${x.done?'checked':''} aria-label="${esc(x.name)} gekauft"><div class="shop-info"><b>${esc(x.name)}</b><small>${fmt(x.qty)} ${esc(x.unit)}</small></div>${x.done?`<button class="mini" data-a="store" data-id="${esc(x.id)}" title="Ins Lager übernehmen">↥</button>`:''}<button class="mini" data-a="editshop" data-id="${esc(x.id)}" aria-label="Bearbeiten">✎</button><button class="mini danger" data-a="deleteshop" data-id="${esc(x.id)}" aria-label="Löschen">×</button></div>`).join(''):'<div class="empty">Noch keine Einkäufe erfasst.</div>';
}
function editor(t=tab,item=null){editing=item?item.id:null;$('itemForm').dataset.target=t;$('modalTitle').textContent=item?'Datensatz bearbeiten':t==='lager'?'Wareneingang erfassen':'Einkauf erfassen';$('name').value=item?item.name:'';$('quantity').value=item?item.qty:1;$('unit').value=item?item.unit:'Stück';$('zone').value=item&&item.zone?item.zone:selected;$('zoneField').hidden=t!=='lager';$('editor').showModal()}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
document.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.zone;document.querySelectorAll('[data-zone]').forEach(n=>n.classList.toggle('active',n===b));render()}));
$('search').addEventListener('input',render);$('addBtn').addEventListener('click',()=>editor());$('close').addEventListener('click',()=>$('editor').close());
$('itemForm').addEventListener('submit',e=>{e.preventDefault();const name=$('name').value.trim(),qty=Number($('quantity').value),t=e.currentTarget.dataset.target;if(!name||!Number.isFinite(qty)||qty<0)return;const arr=t==='lager'?db.stock:db.shopping,old=arr.find(x=>x.id===editing),values={name,qty:Math.round(qty*1000)/1000,unit:$('unit').value};if(t==='lager')values.zone=$('zone').value;if(old)Object.assign(old,values);else arr.push({id:uid(),...values,...(t==='einkauf'?{done:false}:{})});$('editor').close();save()});
$('stockRows').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const x=db.stock.find(n=>String(n.id)===b.dataset.id);if(!x)return;const a=b.dataset.a;if(a==='transfer')return openTransfer(x);if(a==='edit')return editor('lager',x);if(a==='delete'){if(!confirm('Artikel löschen?'))return;db.stock=db.stock.filter(n=>n.id!==x.id)}if(a==='minus'||a==='plus'){const step=['kg','Liter'].includes(x.unit)?0.5:['g','ml'].includes(x.unit)?100:1;x.qty=Math.max(0,Math.round((Number(x.qty)+(a==='plus'?step:-step))*1000)/1000)}save()});
$('shopRows').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const x=db.shopping.find(n=>String(n.id)===b.dataset.id);if(!x)return;const a=b.dataset.a;if(a==='editshop')return editor('einkauf',x);if(a==='deleteshop')db.shopping=db.shopping.filter(n=>n.id!==x.id);if(a==='store'){const choice=prompt('Lagerzone: Kühlschrank, Gefrierschrank oder Regal',selected);if(choice===null)return;const dest=zones.find(z=>z.toLowerCase()===choice.trim().toLowerCase());if(!dest){alert('Ungültige Lagerzone');return}const existing=db.stock.find(n=>n.zone===dest&&n.unit===x.unit&&n.name.toLowerCase()===x.name.toLowerCase());if(existing)existing.qty=Number(existing.qty)+Number(x.qty);else db.stock.push({id:uid(),name:x.name,qty:x.qty,unit:x.unit,zone:dest});db.shopping=db.shopping.filter(n=>n.id!==x.id)}save()});
$('shopRows').addEventListener('change',e=>{const b=e.target;if(b.dataset.a!=='toggle')return;const x=db.shopping.find(n=>String(n.id)===b.dataset.id);if(x){x.done=b.checked;save()}});

let batchItems=[];
const wordNumbers={ein:1,eine:1,einen:1,einem:1,eins:1,zwei:2,drei:3,vier:4,fünf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,elf:11,zwölf:12};
function parseBatch(raw){
 const normalized=raw.replace(/\s+(?:und|sowie)\s+/gi,', ').replace(/[;\n]+/g,',');
 return normalized.split(',').map(chunk=>{
  let s=chunk.trim().replace(/^[•\-\s]+/,'');if(!s)return null;
  let match=s.match(/^(\d+(?:[.,]\d+)?|ein(?:e|en|em)?|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)\s*(ml|milliliter|l|liter|kg|kilogramm|g|gramm|stück|stk\.?|packung(?:en)?|paket(?:e)?|flasche(?:n)?|dose(?:n)?)?\s+(.+)$/i);
  let qty=1,unit='Stück',name=s;
  if(match){qty=wordNumbers[match[1].toLowerCase()]??Number(match[1].replace(',','.'));let u=(match[2]||'').toLowerCase();unit=/^(ml|milliliter)$/.test(u)?'ml':/^(l|liter)$/.test(u)?'Liter':/^(kg|kilogramm)$/.test(u)?'kg':/^(g|gramm)$/.test(u)?'g':/^(packung|packungen|paket|pakete)$/.test(u)?'Packungen':'Stück';name=match[3].trim()}
  if(!Number.isFinite(qty)||qty<=0)return null;
  name=name.replace(/^(?:an|von)\s+/i,'').trim();
  return name?{id:uid(),name,qty,unit,zone:selected}:null;
 }).filter(Boolean);
}
function showBatch(){batchItems=[];$('batchText').value='';$('batchRows').innerHTML='';$('batchCount').textContent='0 Artikel';$('batchDialog').showModal()}
function drawBatch(){
 $('batchCount').textContent=batchItems.length+' Artikel';
 $('batchRows').innerHTML=batchItems.map((x,i)=>`<div class="batch-row" data-index="${i}"><div class="batch-fields"><label>ARTIKEL<input class="batch-name" value="${esc(x.name)}" aria-label="Artikelname"></label><label>MENGE<input class="batch-qty" type="number" step="any" min="0.001" inputmode="decimal" value="${x.qty}" aria-label="Menge"></label><label>EINHEIT<select class="batch-unit" aria-label="Einheit">${['Stück','g','kg','ml','Liter','Packungen'].map(u=>`<option ${u===x.unit?'selected':''}>${u}</option>`).join('')}</select></label></div><div class="batch-zone"><label>LAGERORT<select class="batch-location" aria-label="Lagerort">${zones.map(z=>`<option ${z===x.zone?'selected':''}>${z}</option>`).join('')}</select></label><button class="mini danger" type="button" data-remove="${i}" aria-label="Artikel entfernen">×</button></div></div>`).join('');
}
$('openBatch').addEventListener('click',showBatch);
$('closeBatch').addEventListener('click',()=>$('batchDialog').close());
$('parseBatch').addEventListener('click',()=>{const parsed=parseBatch($('batchText').value);if(!parsed.length){alert('Keine Artikel erkannt. Bitte Einträge mit Kommas trennen, z. B. 500 ml Milch, 3 Eier.');return;}batchItems=parsed;drawBatch()});
$('batchRows').addEventListener('click',e=>{let b=e.target.closest('[data-remove]');if(!b)return;syncBatch();batchItems.splice(Number(b.dataset.remove),1);drawBatch()});
function syncBatch(){document.querySelectorAll('#batchRows .batch-row').forEach(row=>{let x=batchItems[Number(row.dataset.index)];if(!x)return;x.name=row.querySelector('.batch-name').value.trim();x.qty=Number(row.querySelector('.batch-qty').value);x.unit=row.querySelector('.batch-unit').value;x.zone=row.querySelector('.batch-location').value})}
$('batchForm').addEventListener('submit',e=>{e.preventDefault();syncBatch();if(!batchItems.length){alert('Bitte zuerst Artikel erkennen lassen.');return}if(batchItems.some(x=>!x.name||!Number.isFinite(x.qty)||x.qty<=0||!zones.includes(x.zone))){alert('Bitte Artikel und Mengen prüfen.');return}
 for(const x of batchItems){let existing=db.stock.find(y=>y.zone===x.zone&&y.unit===x.unit&&y.name.trim().toLocaleLowerCase('de-DE')===x.name.trim().toLocaleLowerCase('de-DE'));if(existing)existing.qty=Math.round((Number(existing.qty)+x.qty)*1000)/1000;else db.stock.push({id:uid(),name:x.name,qty:Math.round(x.qty*1000)/1000,unit:x.unit,zone:x.zone})}
 $('batchDialog').close();save();alert(batchItems.length+' Artikel eingelagert.');batchItems=[];
});

render();
