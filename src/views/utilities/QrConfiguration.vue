<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { useLocaleStore } from '@/store/locale'
import { redirectToSsoLogin } from '@/utils/ssoRedirect'
import { getQrCodes, saveQrCodes, previewQrCode, type QrItem, type QrState } from '@/api/utilities'
import { applyTextareaEdit, applySelectedTextareaEdit, normalizeTextareaText, pasteTextareaText } from '@/utils/qrText'
import UtilitiesView from './UtilitiesView.vue'
const user = useUserStore(), locale = useLocaleStore()
const copy = (en: string, zh: string) => locale.currentLocale.startsWith('zh') ? zh : en
const items = ref<QrItem[]>([]), saved = ref<QrState>({revision:0,items:[]})
const loaded = ref(false), busy = ref(false), conflict = ref(false), error = ref(''), message = ref('')
const previews = ref<Record<string,{content:string;modules:string[]}>>({}), pending = ref<Record<string,boolean>>({}), previewErrors = ref<Record<string,string>>({})
const templates = ref<Record<string,string>>({})
let generation = 0
const requests: Record<string,number> = {}
const bytes = (s:string) => new TextEncoder().encode(s).length
const invalidSurrogate = (s:string) => /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(s)
const contentValid = (s:string) => !!s.trim() && bytes(s)<=180 && !/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/.test(s) && !invalidSurrogate(s)
const labelValid = (s:string) => !!s.trim() && [...s.trim()].length<=40 && !/[\u0000-\u001F\u007F-\u009F]/.test(s) && !invalidSurrogate(s)
const valid = computed(() => items.value.every(i => labelValid(i.label) && contentValid(i.content)))
const payload = () => items.value.map(i=>({itemId:i.itemId,label:i.label.trim(),content:i.content}))
const dirty = computed(()=>JSON.stringify(payload())!==JSON.stringify(saved.value.items.map(({itemId,label,content})=>({itemId,label,content}))))
function validMatrix(rows?:string[]): rows is string[] { return !!rows && rows.length>=21 && rows.length<=57 && rows.every(r=>r.length===rows.length && /^[01]+$/.test(r)) }
function accept(state:QrState, keep=false) {
 saved.value=state
 state.items.forEach(i=>{templates.value[i.itemId] ||= 'text'})
 if(!keep) { items.value=state.items.map(i=>({...i})); previews.value={}; state.items.forEach(i=>{if(validMatrix(i.modules)) previews.value[i.itemId]={content:i.content,modules:i.modules}}) }
}
async function load(keep=false) {
 if(busy.value || !user.userInfo) return
 const g=generation; busy.value=true; error.value=''
 try { const state=await getQrCodes(); if(g!==generation)return; accept(state,keep); loaded.value=true; conflict.value=false; message.value=keep?copy('Latest saved codes loaded below. Your draft is kept. Review both, then explicitly save your draft.','下方已加载最新保存内容，草稿已保留。请核对后再次保存草稿。'):'' }
 catch {if(g===generation) error.value=copy('Could not load your QR codes. Retry before editing or saving.','无法加载二维码，请重试后再编辑或保存。')}
 finally{if(g===generation)busy.value=false}
}
function add() {if(!loaded.value||busy.value||items.value.length>=3)return; const id=['qr-1','qr-2','qr-3'].find(id=>!items.value.some(i=>i.itemId===id))!; templates.value[id]='text'; items.value.push({itemId:id,label:'',content:''})}
function remove(id:string) {items.value=items.value.filter(i=>i.itemId!==id); requests[id]=(requests[id]||0)+1; delete previews.value[id]; delete pending.value[id]}
function changed(id:string) {requests[id]=(requests[id]||0)+1; delete previews.value[id]; delete previewErrors.value[id]; pending.value[id]=false;message.value=''}
const beforeEdits = new WeakMap<QrItem,{raw:string;start:number;end:number;inputType:string}>()
function beforeContentEdit(item:QrItem,event:Event) {
 const input=event as InputEvent,target=event.target as HTMLTextAreaElement
 if(input.isComposing) { beforeEdits.delete(item); return }
 beforeEdits.set(item,{raw:item.content,start:target.selectionStart,end:target.selectionEnd,inputType:input.inputType})
}
async function editContent(item:QrItem,event:Event) {
 if ((event as InputEvent).isComposing) return
 const target=event.target as HTMLTextAreaElement
 const start=target.selectionStart,end=target.selectionEnd,direction=target.selectionDirection,g=generation
 const before=beforeEdits.get(item)
 beforeEdits.delete(item)
 const content=before?.raw===item.content ? applySelectedTextareaEdit(item.content,target.value,before.start,before.end,before.inputType) : applyTextareaEdit(item.content,target.value)
 item.content=content
 changed(item.itemId)
 await nextTick()
 if(g===generation && target.isConnected && item.content===content) target.setSelectionRange(start,end,direction)
}
async function pasteContent(item:QrItem,event:ClipboardEvent) {
 const target=event.target as HTMLTextAreaElement
 const clipboard=event.clipboardData?.getData('text/plain') || ''
 const start=target.selectionStart,end=target.selectionEnd
 item.content=pasteTextareaText(item.content,start,end,clipboard)
 changed(item.itemId)
 await nextTick()
 target.value=normalizeTextareaText(item.content)
 const cursor=start+normalizeTextareaText(clipboard).length
 target.setSelectionRange(cursor,cursor)
}
async function preview(item:QrItem) {
 if(!contentValid(item.content)||!loaded.value)return
 const g=generation,id=item.itemId,content=item.content,n=requests[id]=(requests[id]||0)+1
 pending.value[id]=true;previewErrors.value[id]=''
 try {const result=await previewQrCode(content);if(g!==generation||requests[id]!==n||!items.value.some(i=>i.itemId===id&&i.content===content))return;if(!validMatrix(result.modules))throw Error('matrix');previews.value[id]={content,modules:result.modules}}
 catch{if(g===generation&&requests[id]===n)previewErrors.value[id]=copy('Preview failed. Please try again.','预览失败，请重试。')}
 finally{if(g===generation&&requests[id]===n)pending.value[id]=false}
}
async function save() {
 if(!loaded.value||busy.value||!valid.value||conflict.value)return
 const g=generation;busy.value=true;error.value='';message.value=''
 try{const result=await saveQrCodes({revision:saved.value.revision,items:payload()});if(g!==generation)return;accept(result);message.value=copy('Saved. Choose Sync now on your watch to apply changes, including deletions.','已保存，请在手表选择「立即同步」应用更改（包括删除）。')}
 catch(e){if(g!==generation)return;const err=e as {code?:number;response?:{status?:number;data?:{code?:number}}};if(err.code===409||err.response?.status===409||err.response?.data?.code===409)conflict.value=true;else error.value=copy('Save failed. Your draft is kept. Please retry.','保存失败，草稿已保留，请重试。')}
 finally{if(g===generation)busy.value=false}
}
function applyTemplate(item:QrItem) {if(item.content)return;const type=templates.value[item.itemId]||'text';item.content=({text:'Your text',url:'https://example.com',tel:'tel:+1234567890',mail:'mailto:hello@example.com',wifi:'WIFI:T:WPA;S:NetworkName;P:Password;;'} as Record<string,string>)[type];changed(item.itemId)}
watch(()=>user.userInfo,()=>{generation++;items.value=[];saved.value={revision:0,items:[]};previews.value={};pending.value={};previewErrors.value={};templates.value={};loaded.value=false;busy.value=false;conflict.value=false;error.value='';message.value='';if(user.userInfo)void load()}, {immediate:true})
onBeforeUnmount(()=>{generation++;items.value=[];previews.value={}})
</script>
<template>
<div class="qr-config">
 <p>{{ copy('Up to three codes per Wristo account, shared with every linked QR Pocket installation. You can configure them before linking a watch.','每个 Wristo 账号最多三个二维码，供所有已绑定的 QR Pocket 使用。可先设置，再绑定手表。') }}</p>
 <button v-if="!user.userInfo" class="primary" @click="redirectToSsoLogin('store')">{{ copy('Sign in to configure','登录后设置') }}</button>
 <template v-else>
 <p v-if="busy" role="status">{{ copy('Working…','处理中…') }}</p>
 <p v-if="error" role="alert" class="error">{{ error }}</p>
 <button v-if="!loaded" :disabled="busy" @click="load()">{{ copy('Retry loading codes','重新加载二维码') }}</button>
 <div v-if="conflict" class="conflict" role="alert"><p>{{ copy('Codes changed elsewhere. Your draft is kept. Reload the latest saved codes, review them, then save again.','二维码已在其他地方更新，草稿已保留。请加载最新保存内容，核对后再次保存。') }}</p><button :disabled="busy" @click="load(true)">{{ copy('Reload latest, keep draft','加载最新内容并保留草稿') }}</button></div>
 <details v-if="loaded && dirty"><summary>{{ copy('Review latest saved codes','查看最新保存内容') }}</summary><p v-if="!saved.items.length">{{ copy('No saved codes.','尚无已保存二维码。') }}</p><div v-for="i in saved.items" :key="i.itemId"><strong>{{ i.label }}</strong><pre>{{ i.content }}</pre></div></details>
 <form @submit.prevent="save">
 <fieldset v-for="(item,index) in items" :key="item.itemId" :disabled="busy || !loaded" class="qr-item"><legend>{{ copy('Code','二维码') }} {{ index+1 }}</legend>
 <label :for="`qr-label-${item.itemId}`">{{ copy('Name (1–40 characters)','名称（1–40 个字符）') }}</label><input :id="`qr-label-${item.itemId}`" v-model="item.label" autocomplete="off"><p v-if="!labelValid(item.label)" class="hint error">{{ copy('Enter 1–40 characters without control characters.','请输入 1–40 个字符，不可包含控制字符。') }}</p>
 <label :for="`qr-content-${item.itemId}`">{{ copy('QR content','二维码内容') }}</label><textarea :id="`qr-content-${item.itemId}`" :value="normalizeTextareaText(item.content)" rows="4" spellcheck="false" autocomplete="off" @beforeinput="beforeContentEdit(item,$event)" @input="editContent(item,$event)" @compositionstart="changed(item.itemId)" @compositionend="editContent(item,$event)" @paste.prevent="pasteContent(item,$event)"/><p class="hint" :class="{error:!contentValid(item.content)}">{{ bytes(item.content) }} / 180 UTF-8 {{ copy('bytes · Text is saved exactly as entered.','字节 · 按原样保存输入内容。') }}</p><p v-if="!contentValid(item.content)" class="hint error">{{ copy('Enter nonblank text within 180 bytes. Line breaks and tabs are allowed; other control characters are not.','内容不能为空，且不能超过 180 字节。允许换行和制表符，不允许其他控制字符。') }}</p>
 <div class="template-row"><label :for="`template-${item.itemId}`">{{ copy('Starter template','填写模板') }}</label><select :id="`template-${item.itemId}`" v-model="templates[item.itemId]"><option value="text">{{ copy('Plain text','普通文字') }}</option><option value="url">URL</option><option value="tel">{{ copy('Phone','电话') }}</option><option value="mail">Email</option><option value="wifi">Wi-Fi</option></select><button type="button" :disabled="!!item.content" @click="applyTemplate(item)">{{ copy('Insert into empty content','插入到空白内容') }}</button></div>
 <div class="actions"><button type="button" :disabled="!contentValid(item.content)||pending[item.itemId]" @click="preview(item)">{{ copy('Preview QR','预览二维码') }}</button><button type="button" @click="remove(item.itemId)">{{ copy('Delete code','删除二维码') }}</button></div>
 <p v-if="previewErrors[item.itemId]" class="error" role="alert">{{ previewErrors[item.itemId] }}</p>
 <svg v-if="previews[item.itemId]?.content===item.content" class="qr-preview" :viewBox="`0 0 ${previews[item.itemId].modules.length+8} ${previews[item.itemId].modules.length+8}`" role="img" :aria-label="copy('QR code preview','二维码预览')" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><template v-for="(row,y) in previews[item.itemId].modules" :key="y"><template v-for="(cell,x) in row" :key="x"><rect v-if="cell==='1'" :x="x+4" :y="y+4" width="1" height="1" fill="black"/></template></template></svg>
 </fieldset>
 <p v-if="loaded&&!items.length">{{ copy('No codes yet. Add your first code below.','尚无二维码，请在下方添加。') }}</p><div class="actions"><button type="button" :disabled="!loaded||busy||items.length>=3" @click="add">{{ copy('Add code','添加二维码') }} ({{items.length}}/3)</button><button class="primary" :disabled="!loaded||busy||!valid||!dirty||conflict">{{ copy('Save codes','保存二维码') }}</button></div></form>
 <p v-if="message" role="status" class="success">{{message}}</p>
 </template>
 <aside><h3>{{ copy('Make it easy to scan','让扫描更容易') }}</h3><p>{{ copy('Use shorter text for a clearer code. Test the preview with your phone first. Increase watch brightness and hold still when scanning.','文字越短，二维码越清晰。请先用手机扫描预览验证；扫描手表时调亮屏幕并保持静止。') }}</p><p>{{ copy('URLs: include https://. Phone: tel:+countrycode… Email: mailto:name@example.com. Wi-Fi: replace NetworkName and Password; prefix each backslash, semicolon, comma, colon, or double quote within either value with a backslash. Never alter the template separators.','网址请包含 https://；电话使用 tel:+国家码…；邮件使用 mailto:name@example.com。Wi-Fi 请替换 NetworkName 和 Password；名称或密码中的反斜杠、分号、逗号、冒号或双引号前均需加反斜杠转义，模板分隔符不变。') }}</p><p>{{ copy('These are static codes, not dynamic payments, tickets, or one-time passwords. Content is stored on Wristo and your watch; avoid secrets. Deletions reach the watch only after Sync now. An offline watch may still show old cached codes.','此处是静态二维码，不适用于动态付款码、票券或一次性密码。内容会保存在 Wristo 和手表上，请避免敏感信息。删除需在手表「立即同步」后生效，离线手表仍可能显示旧缓存。') }}</p></aside>
 <UtilitiesView app-key="qr-pocket" embedded/>
</div>
</template>
<style scoped>
p{line-height:1.7;color:#526a65}label{display:block;font-weight:600;margin:16px 0 8px}input,textarea,select{box-sizing:border-box;width:100%;min-height:46px;border:1px solid #a6bbb0;border-radius:6px;padding:12px;font:inherit;background:white;color:#122a2b}textarea{resize:vertical}button{min-height:44px;padding:10px 16px;border:1px solid #a6bbb0;border-radius:6px;background:white;color:#122a2b;font:inherit;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.primary{background:#122a2b;color:white}.qr-item{min-width:0;border:0;border-top:1px solid #c7d6cd;margin:28px 0;padding:18px 0}legend{font-weight:700;font-size:20px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}.template-row{max-width:480px}.template-row button{margin-top:10px}.hint{font-size:13px}.qr-preview{display:block;width:260px;max-width:100%;height:auto;margin:20px 0}.error{color:#a32828}.success{color:#226149}.conflict{padding:18px;background:#fff4de}pre{white-space:pre-wrap;overflow-wrap:anywhere}aside{margin:32px 0;padding:20px;background:#eef3ee;border-radius:6px}summary{cursor:pointer;padding:16px 0}input:focus-visible,textarea:focus-visible,select:focus-visible,button:focus-visible{outline:3px solid #38806d;outline-offset:3px}
</style>
