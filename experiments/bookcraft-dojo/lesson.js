// Owner-controlled asset slot. Activate only with the reviewed PDF and matching copy.
export const lesson = {url:null,version:null,approved:false};
export async function downloadLesson(){
 if(!lesson.approved||!lesson.url||!lesson.version)return false;
 try{const url=new URL(lesson.url,location.href);if(url.origin!==location.origin)return false;const response=await fetch(url,{cache:'no-store'});if(!response.ok)return false;const blob=await response.blob();if((await blob.slice(0,5).text())!=='%PDF-')return false;const objectUrl=URL.createObjectURL(blob);const link=document.createElement('a');link.href=objectUrl;link.download=`bookcraft-volume-1-${lesson.version}.pdf`;link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);return true}catch{return false}
}
