// Explicit user-controlled reading. No recognition runs while choosing a result.
export class ReadCycle{
 constructor({maxAttempts=6,maxDurationMs=2500}={}){this.maxAttempts=maxAttempts;this.maxDurationMs=maxDurationMs;this.state='idle';this.attempts=0;}
 begin(now){this.startedAt=now;this.attempts=0;this.state='reading';}
 next(now){if(this.state!=='reading')return false;if(this.attempts>=this.maxAttempts||now-this.startedAt>=this.maxDurationMs){this.state='failed';return false;}this.attempts++;return true;}
 hold(){this.state='choosing';}
 selected(){this.state='selected';}
 cancel(){this.state='idle';}
 get reading(){return this.state==='reading';}
}
