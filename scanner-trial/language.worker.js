// Tesseract.js Apache-2.0; pinned runtime. Images remain in this worker.
self.onmessage=async event=>{
  let ocr;
  try {
    importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js');
    ocr=await Tesseract.createWorker('jpn+eng',1,{
      workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',
      corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',
    });
    await ocr.setParameters({tessedit_pageseg_mode:'6'});
    const {data}=await ocr.recognize(event.data);
    self.postMessage({text:data.text,confidence:data.confidence});
  } catch { self.postMessage({text:'',confidence:0,error:true}); }
  finally {await ocr?.terminate();}
};
