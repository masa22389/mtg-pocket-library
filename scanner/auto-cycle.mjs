// Live preview is independent from recognition. Hold candidates only while choosing.
export class AutoReadCycle{
 constructor(){this.state='idle';this.presentCount=0;this.absentCount=0;}
 begin(){this.state='reading';this.presentCount=0;this.absentCount=0;}
 next(){return this.reading;}
 observe(present){
  if(this.state==='waiting-exit'){
   this.absentCount=present?0:this.absentCount+1;
   if(this.absentCount>=2)this.begin();
   return false;
  }
  if(this.state!=='reading')return false;
  this.presentCount=present?this.presentCount+1:0;
  return this.presentCount>=2;
 }
 hold(){this.state='choosing';}
 selected(){this.state='waiting-exit';this.presentCount=0;this.absentCount=0;}
 cancel(){this.state='idle';this.presentCount=0;this.absentCount=0;}
 get reading(){return this.state==='reading'||this.state==='waiting-exit';}
}
